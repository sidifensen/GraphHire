package com.graphhire.match.application.service;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.match.domain.service.MatchDomainService;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.match.interfaces.dto.response.MatchDetailResponse;
import com.graphhire.match.infrastructure.mq.MatchMQProducer;
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
import static org.mockito.Mockito.verifyNoInteractions;
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
    @Mock
    private CompanyStaffRepository companyStaffRepository;
    @Mock
    private MatchMQProducer matchMQProducer;

    @InjectMocks
    private MatchAppService matchAppService;

    @Test
    void triggerMatchForJob_shouldRebuildRecordsForAllParsedResumes() {
        Long jobId = 10L;

        matchAppService.triggerMatchForJob(jobId);

        verify(matchMQProducer).sendJobMatchPlan(jobId);
        verifyNoInteractions(matchRecordRepository, resumeRepository, matchDomainService);
    }

    @Test
    void triggerMatchForResume_shouldDispatchPlanInsteadOfExecutingInline() {
        Long resumeId = 20L;

        matchAppService.triggerMatchForResume(resumeId);

        verify(matchMQProducer).sendResumeMatchPlan(resumeId);
        verifyNoInteractions(matchRecordRepository, jobRepository, matchDomainService);
    }

    @Test
    void executeResumeMatchBatch_shouldRetryThreeTimesThenSkipFailedJob() {
        Long resumeId = 21L;
        MatchRecord newFor301 = MatchRecord.create(resumeId, 301L, MatchScore.of(90, 80));
        newFor301.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);

        when(matchDomainService.calculateMatch(resumeId, 301L)).thenReturn(newFor301);
        when(matchDomainService.calculateMatch(resumeId, 302L))
            .thenThrow(new RuntimeException("boom-1"))
            .thenThrow(new RuntimeException("boom-2"))
            .thenThrow(new RuntimeException("boom-3"));

        assertDoesNotThrow(() -> matchAppService.executeResumeMatchBatch(resumeId, List.of(301L, 302L)));

        verify(matchDomainService).calculateMatch(resumeId, 301L);
        verify(matchDomainService, times(3)).calculateMatch(resumeId, 302L);
        verify(matchRecordRepository, times(1)).save(any(MatchRecord.class));
    }

    @Test
    void executeResumeMatchBatch_shouldRetryAndSucceedOnThirdAttempt() {
        Long resumeId = 22L;
        MatchRecord newRecord = MatchRecord.create(resumeId, 401L, MatchScore.of(95, 90));
        newRecord.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);

        when(matchDomainService.calculateMatch(resumeId, 401L))
            .thenThrow(new RuntimeException("boom-1"))
            .thenThrow(new RuntimeException("boom-2"))
            .thenReturn(newRecord);

        assertDoesNotThrow(() -> matchAppService.executeResumeMatchBatch(resumeId, List.of(401L)));

        verify(matchDomainService, times(3)).calculateMatch(resumeId, 401L);
        verify(matchRecordRepository, times(1)).save(any(MatchRecord.class));
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
        when(jobRepository.findByIds(List.of(jobId))).thenReturn(List.of(job));
        when(resumeRepository.findByIds(List.of(101L))).thenReturn(List.of(resume));
        when(personInfoRepository.findByUserIds(List.of(1001L))).thenReturn(List.of(personInfo));

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
        when(jobRepository.findByIds(List.of(jobId))).thenReturn(List.of(job));
        when(resumeRepository.findByIds(List.of(102L))).thenReturn(List.of(resume));

        List<MatchDetailResponse> responses = matchAppService.getMatchListForJob(jobId);

        assertEquals(1, responses.size());
        MatchDetailResponse.ResumeBasicInfo resumeInfo = responses.get(0).getResume();
        assertNotNull(resumeInfo);
        assertEquals(List.of(), resumeInfo.getSkills());
        assertEquals(null, resumeInfo.getEducation());
        assertEquals(null, resumeInfo.getExperience());
    }
}
