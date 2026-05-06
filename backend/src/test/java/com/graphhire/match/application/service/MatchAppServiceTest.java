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

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
    void triggerMatchForResume_shouldUpdateExistingAndDeleteOnlyStaleRecords() {
        Long resumeId = 20L;

        Job publishedJob1 = new Job();
        publishedJob1.setId(201L);
        publishedJob1.setStatus(JobStatus.PUBLISHED);
        Job draftJob = new Job();
        draftJob.setId(202L);
        draftJob.setStatus(JobStatus.DRAFT);
        Job publishedJob3 = new Job();
        publishedJob3.setId(203L);
        publishedJob3.setStatus(JobStatus.PUBLISHED);

        MatchRecord oldFor201 = MatchRecord.create(resumeId, 201L, MatchScore.of(30, 20));
        oldFor201.setId(901L);
        oldFor201.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);
        MatchRecord staleFor999 = MatchRecord.create(resumeId, 999L, MatchScore.of(20, 10));
        staleFor999.setId(902L);
        staleFor999.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);

        MatchRecord newFor201 = MatchRecord.create(resumeId, 201L, MatchScore.of(91, 83));
        newFor201.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);
        MatchRecord newFor203 = MatchRecord.create(resumeId, 203L, MatchScore.of(88, 81));
        newFor203.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);

        when(jobRepository.findAll()).thenReturn(List.of(publishedJob1, draftJob, publishedJob3));
        when(matchRecordRepository.findByResumeId(resumeId)).thenReturn(List.of(oldFor201, staleFor999));
        when(matchDomainService.calculateMatch(resumeId, 201L)).thenReturn(newFor201);
        when(matchDomainService.calculateMatch(resumeId, 203L)).thenReturn(newFor203);

        matchAppService.triggerMatchForResume(resumeId);

        verify(matchRecordRepository, never()).deleteByResumeId(resumeId);
        verify(matchDomainService).calculateMatch(resumeId, 201L);
        verify(matchDomainService).calculateMatch(resumeId, 203L);
        verify(matchDomainService, never()).calculateMatch(resumeId, 202L);

        verify(matchRecordRepository, times(2)).save(any(MatchRecord.class));
        verify(matchRecordRepository).delete(staleFor999);
        verify(matchRecordRepository, never()).delete(oldFor201);
    }

    @Test
    void triggerMatchForResume_shouldRetryThreeTimesThenSkipFailedJob() {
        Long resumeId = 21L;

        Job publishedJob1 = new Job();
        publishedJob1.setId(301L);
        publishedJob1.setStatus(JobStatus.PUBLISHED);
        Job publishedJob2 = new Job();
        publishedJob2.setId(302L);
        publishedJob2.setStatus(JobStatus.PUBLISHED);

        MatchRecord oldFor301 = MatchRecord.create(resumeId, 301L, MatchScore.of(50, 40));
        oldFor301.setId(1001L);
        oldFor301.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);
        MatchRecord oldFor999 = MatchRecord.create(resumeId, 999L, MatchScore.of(50, 40));
        oldFor999.setId(1002L);
        oldFor999.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);

        MatchRecord newFor301 = MatchRecord.create(resumeId, 301L, MatchScore.of(90, 80));
        newFor301.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);

        when(jobRepository.findAll()).thenReturn(List.of(publishedJob1, publishedJob2));
        when(matchRecordRepository.findByResumeId(resumeId)).thenReturn(List.of(oldFor301, oldFor999));
        when(matchDomainService.calculateMatch(resumeId, 301L)).thenReturn(newFor301);
        when(matchDomainService.calculateMatch(resumeId, 302L))
            .thenThrow(new RuntimeException("boom-1"))
            .thenThrow(new RuntimeException("boom-2"))
            .thenThrow(new RuntimeException("boom-3"));

        assertDoesNotThrow(() -> matchAppService.triggerMatchForResume(resumeId));

        verify(matchDomainService).calculateMatch(resumeId, 301L);
        verify(matchDomainService, times(3)).calculateMatch(resumeId, 302L);
        verify(matchRecordRepository, times(1)).save(any(MatchRecord.class));
        verify(matchRecordRepository).delete(oldFor999);
        verify(matchRecordRepository, never()).delete(oldFor301);
    }

    @Test
    void triggerMatchForResume_shouldRetryAndSucceedOnThirdAttempt() {
        Long resumeId = 22L;

        Job publishedJob = new Job();
        publishedJob.setId(401L);
        publishedJob.setStatus(JobStatus.PUBLISHED);

        MatchRecord existing = MatchRecord.create(resumeId, 401L, MatchScore.of(60, 50));
        existing.setId(2001L);
        existing.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);

        MatchRecord newRecord = MatchRecord.create(resumeId, 401L, MatchScore.of(95, 90));
        newRecord.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);

        when(jobRepository.findAll()).thenReturn(List.of(publishedJob));
        when(matchRecordRepository.findByResumeId(resumeId)).thenReturn(List.of(existing));
        when(matchDomainService.calculateMatch(resumeId, 401L))
            .thenThrow(new RuntimeException("boom-1"))
            .thenThrow(new RuntimeException("boom-2"))
            .thenReturn(newRecord);

        assertDoesNotThrow(() -> matchAppService.triggerMatchForResume(resumeId));

        verify(matchDomainService, times(3)).calculateMatch(resumeId, 401L);
        verify(matchRecordRepository, times(1)).save(any(MatchRecord.class));
        verify(matchRecordRepository, never()).delete(existing);
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
