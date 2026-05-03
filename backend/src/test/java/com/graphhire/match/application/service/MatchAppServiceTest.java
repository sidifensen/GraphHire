package com.graphhire.match.application.service;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.match.domain.service.MatchDomainService;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.match.interfaces.dto.response.MatchDetailResponse;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchAppServiceTest {

    @Mock
    private MatchRecordRepository matchRecordRepository;
    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private MatchDomainService matchDomainService;
    @Mock
    private NotificationAppService notificationAppService;
    @Mock
    private PersonInfoRepository personInfoRepository;

    @InjectMocks
    private MatchAppService matchAppService;

    @Test
    void triggerMatchForJob_shouldRebuildRecordsForAllParsedResumes() {
        Long jobId = 10L;
        Resume r1 = new Resume();
        r1.setId(101L);
        Resume r2 = new Resume();
        r2.setId(102L);

        when(resumeRepository.findByParseStatus(ParseStatus.SUCCESS)).thenReturn(List.of(r1, r2));
        when(matchDomainService.calculateMatch(101L, jobId)).thenReturn(new MatchRecord());
        when(matchDomainService.calculateMatch(102L, jobId)).thenReturn(new MatchRecord());

        matchAppService.triggerMatchForJob(jobId);

        verify(matchRecordRepository).deleteByJobId(jobId);
        verify(resumeRepository).findByParseStatus(ParseStatus.SUCCESS);
        verify(matchDomainService).calculateMatch(101L, jobId);
        verify(matchDomainService).calculateMatch(102L, jobId);
        verify(matchRecordRepository, times(2)).save(any(MatchRecord.class));
    }

    @Test
    void triggerMatchForResume_shouldRebuildRecordsForAllPublishedJobs() {
        Long resumeId = 20L;
        Job job1 = new Job();
        job1.setId(201L);
        job1.setStatus(JobStatus.PUBLISHED);
        Job job2 = new Job();
        job2.setId(202L);
        job2.setStatus(JobStatus.DRAFT);
        Job job3 = new Job();
        job3.setId(203L);
        job3.setStatus(JobStatus.PUBLISHED);

        when(jobRepository.findAll()).thenReturn(List.of(job1, job2, job3));
        when(matchDomainService.calculateMatch(resumeId, 201L)).thenReturn(new MatchRecord());
        when(matchDomainService.calculateMatch(resumeId, 203L)).thenReturn(new MatchRecord());

        matchAppService.triggerMatchForResume(resumeId);

        verify(matchRecordRepository).deleteByResumeId(resumeId);
        verify(jobRepository).findAll();
        verify(matchDomainService).calculateMatch(resumeId, 201L);
        verify(matchDomainService).calculateMatch(resumeId, 203L);
        verify(matchDomainService, never()).calculateMatch(resumeId, 202L);
        verify(matchRecordRepository, times(2)).save(any(MatchRecord.class));
    }

    @Test
    void getMatchListForJob_shouldIncludeResumeSummaryFields() {
        Long jobId = 300L;
        MatchRecord record = MatchRecord.create(101L, jobId, MatchScore.of(90, 80));

        Resume resume = new Resume();
        resume.setId(101L);
        resume.setUserId(1001L);
        resume.setFileName("candidate-a.pdf");
        resume.setParseResult("{" +
            "\"skills\":[\"Java\",\"Spring Boot\"]," +
            "\"education\":[{\"degree\":\"本科\"}]," +
            "\"experience\":[{\"company\":\"A\"},{\"company\":\"B\"}]" +
            "}");

        PersonInfo personInfo = new PersonInfo();
        personInfo.setUserId(1001L);
        personInfo.setRealName("张三");
        personInfo.setAvatarUrl("avatar/user_1001.png");

        Job job = new Job();
        job.setId(jobId);
        job.setTitle("后端工程师");

        when(matchRecordRepository.findByJobId(jobId)).thenReturn(List.of(record));
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        when(resumeRepository.findById(101L)).thenReturn(Optional.of(resume));
        when(personInfoRepository.findByUserId(1001L)).thenReturn(Optional.of(personInfo));

        List<MatchDetailResponse> responses = matchAppService.getMatchListForJob(jobId);

        assertEquals(1, responses.size());
        MatchDetailResponse.ResumeBasicInfo resumeInfo = responses.get(0).getResume();
        assertNotNull(resumeInfo);
        assertEquals("张三", resumeInfo.getUserName());
        assertEquals("/person/avatar/public/1001", resumeInfo.getAvatarUrl());
        assertEquals(List.of("Java", "Spring Boot"), resumeInfo.getSkills());
        assertEquals("本科", resumeInfo.getEducation());
        assertEquals("2段经历", resumeInfo.getExperience());
    }

    @Test
    void getMatchListForJob_shouldGracefullyHandleBrokenParseResult() {
        Long jobId = 301L;
        MatchRecord record = MatchRecord.create(102L, jobId, MatchScore.of(80, 70));

        Resume resume = new Resume();
        resume.setId(102L);
        resume.setFileName("candidate-b.pdf");
        resume.setParseResult("not-json");

        Job job = new Job();
        job.setId(jobId);
        job.setTitle("前端工程师");

        when(matchRecordRepository.findByJobId(jobId)).thenReturn(List.of(record));
        when(jobRepository.findById(jobId)).thenReturn(Optional.of(job));
        when(resumeRepository.findById(102L)).thenReturn(Optional.of(resume));

        List<MatchDetailResponse> responses = matchAppService.getMatchListForJob(jobId);

        assertEquals(1, responses.size());
        MatchDetailResponse.ResumeBasicInfo resumeInfo = responses.get(0).getResume();
        assertNotNull(resumeInfo);
        assertEquals(List.of(), resumeInfo.getSkills());
        assertEquals(null, resumeInfo.getEducation());
        assertEquals(null, resumeInfo.getExperience());
    }
}
