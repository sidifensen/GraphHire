package com.graphhire.application.service;

import com.graphhire.application.dto.MatchDetailResponse;
import com.graphhire.application.dto.MatchListResponse;
import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.Company;
import com.graphhire.domain.model.Job;
import com.graphhire.domain.model.MatchRecord;
import com.graphhire.domain.model.Notification;
import com.graphhire.domain.model.Person;
import com.graphhire.domain.model.Resume;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.JobRepository;
import com.graphhire.domain.repository.MatchRecordRepository;
import com.graphhire.domain.repository.NotificationRepository;
import com.graphhire.domain.repository.PersonRepository;
import com.graphhire.domain.repository.ResumeRepository;
import com.graphhire.domain.service.MatchDomainService;
import com.graphhire.domain.vo.JobStatus;
import com.graphhire.domain.vo.NotificationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
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
    private PersonRepository personRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private MatchDomainService matchDomainService;

    @InjectMocks
    private MatchAppService matchAppService;

    @Nested
    @DisplayName("职位推荐测试")
    class RecommendJobsTests {

        @Test
        @DisplayName("成功推荐职位")
        void recommendJobs_Success() {
            // Given
            Long userId = 1L;
            Integer page = 1;
            Integer pageSize = 10;
            Resume resume = Resume.builder()
                    .id(1L)
                    .userId(userId)
                    .parseResult("{\"skills\": [\"Java\", \"Python\"]}")
                    .build();
            Job job = Job.builder()
                    .id(1L)
                    .jobTitle("Java Engineer")
                    .companyId(1L)
                    .city("Beijing")
                    .build();
            Company company = Company.builder()
                    .id(1L)
                    .companyName("Test Company")
                    .build();
            MatchRecord matchRecord = MatchRecord.builder()
                    .id(1L)
                    .resumeId(1L)
                    .jobId(1L)
                    .overallScore(BigDecimal.valueOf(85))
                    .skillScore(BigDecimal.valueOf(80))
                    .experienceScore(BigDecimal.valueOf(90))
                    .cityScore(BigDecimal.valueOf(85))
                    .educationScore(BigDecimal.valueOf(80))
                    .salaryScore(BigDecimal.valueOf(85))
                    .matchReport("匹配度报告")
                    .createdAt(LocalDateTime.now())
                    .build();

            when(resumeRepository.findDefaultByUserIdOptional(userId)).thenReturn(Optional.of(resume));
            when(jobRepository.findByJobStatus(JobStatus.PUBLISHED, 1, Integer.MAX_VALUE)).thenReturn(Arrays.asList(job));
            when(companyRepository.findByIdOptional(1L)).thenReturn(Optional.of(company));
            when(personRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(Person.builder().id(1L).build()));
            when(matchDomainService.calculateSkillScore(anyList(), anyList())).thenReturn(BigDecimal.valueOf(80));
            when(matchDomainService.calculateExperienceScore(any(), any())).thenReturn(BigDecimal.valueOf(90));
            when(matchDomainService.calculateCityScore(any(), any())).thenReturn(BigDecimal.valueOf(85));
            when(matchDomainService.calculateEducationScore(any(), any())).thenReturn(BigDecimal.valueOf(80));
            when(matchDomainService.calculateSalaryScore(any(), any(), any())).thenReturn(BigDecimal.valueOf(85));
            when(matchDomainService.calculateOverallScore(any(), any(), any(), any(), any())).thenReturn(BigDecimal.valueOf(85));
            when(matchRecordRepository.save(any(MatchRecord.class))).thenReturn(matchRecord);

            // When
            PageResult<MatchListResponse> result = matchAppService.recommendJobs(userId, page, pageSize);

            // Then
            assertNotNull(result);
        }

        @Test
        @DisplayName("用户没有简历时抛出异常")
        void recommendJobs_NoResume_ThrowsException() {
            // Given
            Long userId = 999L;
            when(resumeRepository.findDefaultByUserIdOptional(userId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> matchAppService.recommendJobs(userId, 1, 10));
            assertEquals("请先上传简历", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("候选人推荐测试")
    class RecommendCandidatesTests {

        @Test
        @DisplayName("成功推荐候选人")
        void recommendCandidates_Success() {
            // Given
            Long userId = 1L;
            Long jobId = 1L;
            Integer page = 1;
            Integer pageSize = 10;

            Job job = Job.builder()
                    .id(jobId)
                    .companyId(1L)
                    .jobTitle("Java Engineer")
                    .city("Beijing")
                    .build();
            Company company = Company.builder()
                    .id(1L)
                    .userId(userId)
                    .companyName("Test Company")
                    .build();
            Resume resume = Resume.builder()
                    .id(1L)
                    .userId(2L)
                    .parseResult("{}")
                    .build();
            Person person = Person.builder()
                    .id(1L)
                    .userId(2L)
                    .build();
            MatchRecord matchRecord = MatchRecord.builder()
                    .id(1L)
                    .resumeId(1L)
                    .jobId(1L)
                    .overallScore(BigDecimal.valueOf(85))
                    .build();

            when(jobRepository.findByIdOptional(jobId)).thenReturn(Optional.of(job));
            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));
            when(resumeRepository.findAllDefaultResumes()).thenReturn(Arrays.asList(resume));
            when(personRepository.findByUserIdOptional(2L)).thenReturn(Optional.of(person));
            when(matchDomainService.calculateSkillScore(anyList(), anyList())).thenReturn(BigDecimal.valueOf(80));
            when(matchDomainService.calculateExperienceScore(any(), any())).thenReturn(BigDecimal.valueOf(90));
            when(matchDomainService.calculateCityScore(any(), any())).thenReturn(BigDecimal.valueOf(85));
            when(matchDomainService.calculateEducationScore(any(), any())).thenReturn(BigDecimal.valueOf(80));
            when(matchDomainService.calculateSalaryScore(any(), any(), any())).thenReturn(BigDecimal.valueOf(85));
            when(matchDomainService.calculateOverallScore(any(), any(), any(), any(), any())).thenReturn(BigDecimal.valueOf(85));
            when(matchRecordRepository.save(any(MatchRecord.class))).thenReturn(matchRecord);

            // When
            PageResult<MatchListResponse> result = matchAppService.recommendCandidates(userId, jobId, page, pageSize);

            // Then
            assertNotNull(result);
        }

        @Test
        @DisplayName("职位不存在时抛出异常")
        void recommendCandidates_JobNotFound_ThrowsException() {
            // Given
            Long userId = 1L;
            Long jobId = 999L;
            when(jobRepository.findByIdOptional(jobId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> matchAppService.recommendCandidates(userId, jobId, 1, 10));
            assertEquals("职位不存在", exception.getMessage());
        }

        @Test
        @DisplayName("无权限查看候选人时抛出异常")
        void recommendCandidates_NoPermission_ThrowsException() {
            // Given
            Long userId = 1L;
            Long jobId = 1L;
            Job job = Job.builder()
                    .id(jobId)
                    .companyId(2L) // Different company
                    .build();
            Company company = Company.builder()
                    .id(1L)
                    .userId(userId)
                    .build();

            when(jobRepository.findByIdOptional(jobId)).thenReturn(Optional.of(job));
            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> matchAppService.recommendCandidates(userId, jobId, 1, 10));
            assertEquals("无权限查看此职位的候选人", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("匹配详情测试")
    class GetMatchDetailTests {

        @Test
        @DisplayName("成功获取匹配详情")
        void getMatchDetail_Success() {
            // Given
            Long matchRecordId = 1L;
            MatchRecord record = MatchRecord.builder()
                    .id(matchRecordId)
                    .resumeId(1L)
                    .jobId(2L)
                    .overallScore(BigDecimal.valueOf(85))
                    .skillScore(BigDecimal.valueOf(80))
                    .experienceScore(BigDecimal.valueOf(90))
                    .cityScore(BigDecimal.valueOf(85))
                    .educationScore(BigDecimal.valueOf(80))
                    .salaryScore(BigDecimal.valueOf(85))
                    .matchReport("匹配度报告")
                    .createdAt(LocalDateTime.now())
                    .build();

            when(matchRecordRepository.findByIdOptional(matchRecordId)).thenReturn(Optional.of(record));

            // When
            MatchDetailResponse response = matchAppService.getMatchDetail(matchRecordId);

            // Then
            assertNotNull(response);
            assertEquals(matchRecordId, response.getMatchRecordId());
            assertEquals(BigDecimal.valueOf(85), response.getOverallScore());
            assertEquals(BigDecimal.valueOf(80), response.getSkillScore());
        }

        @Test
        @DisplayName("匹配记录不存在时抛出异常")
        void getMatchDetail_NotFound_ThrowsException() {
            // Given
            Long matchRecordId = 999L;
            when(matchRecordRepository.findByIdOptional(matchRecordId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> matchAppService.getMatchDetail(matchRecordId));
            assertEquals("匹配记录不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("标记已读测试")
    class MarkAsReadTests {

        @Test
        @DisplayName("成功标记匹配记录为已读")
        void markAsRead_Success() {
            // Given
            Long matchRecordId = 1L;
            MatchRecord record = MatchRecord.builder()
                    .id(matchRecordId)
                    .status(0)
                    .build();

            when(matchRecordRepository.findByIdOptional(matchRecordId)).thenReturn(Optional.of(record));
            when(matchRecordRepository.save(any(MatchRecord.class))).thenReturn(record);

            // When
            matchAppService.markAsRead(matchRecordId);

            // Then
            assertEquals(1, record.getStatus());
            verify(matchRecordRepository).save(record);
        }

        @Test
        @DisplayName("匹配记录不存在时标记失败")
        void markAsRead_NotFound_ThrowsException() {
            // Given
            Long matchRecordId = 999L;
            when(matchRecordRepository.findByIdOptional(matchRecordId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> matchAppService.markAsRead(matchRecordId));
            assertEquals("匹配记录不存在", exception.getMessage());
        }
    }
}
