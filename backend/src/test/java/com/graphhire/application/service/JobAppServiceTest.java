package com.graphhire.application.service;

import com.graphhire.application.command.JobPublishCmd;
import com.graphhire.application.command.JobUpdateCmd;
import com.graphhire.application.dto.JobDetailResponse;
import com.graphhire.application.dto.JobPublishResponse;
import com.graphhire.application.dto.PageResult;
import com.graphhire.application.dto.SkillTagDto;
import com.graphhire.domain.model.Company;
import com.graphhire.domain.model.Job;
import com.graphhire.domain.model.JobSkill;
import com.graphhire.domain.model.ParseTask;
import com.graphhire.domain.model.SkillTag;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.CompanyStaffRepository;
import com.graphhire.domain.repository.JobRepository;
import com.graphhire.domain.repository.JobSkillRepository;
import com.graphhire.domain.repository.ParseTaskRepository;
import com.graphhire.domain.repository.SkillTagRepository;
import com.graphhire.domain.vo.JobStatus;
import com.graphhire.domain.vo.ParseStatus;
import com.graphhire.domain.vo.TaskStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobAppServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CompanyStaffRepository companyStaffRepository;

    @Mock
    private JobSkillRepository jobSkillRepository;

    @Mock
    private SkillTagRepository skillTagRepository;

    @Mock
    private ParseTaskRepository parseTaskRepository;

    @InjectMocks
    private JobAppService jobAppService;

    @Nested
    @DisplayName("发布职位测试")
    class PublishTests {

        @Test
        @DisplayName("成功发布职位")
        void publish_Success() {
            // Given
            Long userId = 1L;
            JobPublishCmd cmd = new JobPublishCmd();
            cmd.setJobTitle("Java Engineer");
            cmd.setDepartment("研发部");
            cmd.setHeadcount(5);
            cmd.setCity("北京");
            cmd.setAddress("朝阳区xxx");
            cmd.setSalaryMin(15000);
            cmd.setSalaryMax(30000);
            cmd.setSalaryUnit("月");
            cmd.setEducationRequired("本科");
            cmd.setExperienceRequired("3-5年");
            cmd.setJobType("全职");
            cmd.setDescriptionFilePath("/uploads/job_desc.pdf");
            cmd.setSkillTagIds(Arrays.asList(1L));

            Company company = Company.builder()
                    .id(1L)
                    .userId(userId)
                    .companyName("Test Company")
                    .build();

            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));
            when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> {
                Job job = invocation.getArgument(0);
                job.setId(1L);
                return job;
            });
            when(skillTagRepository.findByIdOptional(anyLong())).thenReturn(Optional.of(
                    SkillTag.builder().id(1L).tagName("Java").build()));
            doNothing().when(jobSkillRepository).save(any(JobSkill.class));
            when(parseTaskRepository.save(any(ParseTask.class))).thenAnswer(invocation -> {
                ParseTask task = invocation.getArgument(0);
                task.setId(1L);
                return task;
            });

            // When
            JobPublishResponse response = jobAppService.publish(userId, cmd);

            // Then
            assertNotNull(response);
            assertEquals(1L, response.getJobId());
            assertEquals(1L, response.getParseTaskId());
            assertEquals("职位发布成功，等待审核", response.getMessage());

            ArgumentCaptor<Job> jobCaptor = ArgumentCaptor.forClass(Job.class);
            verify(jobRepository).save(jobCaptor.capture());
            assertEquals("Java Engineer", jobCaptor.getValue().getJobTitle());
            assertEquals(JobStatus.PENDING_REVIEW, jobCaptor.getValue().getJobStatus());
        }

        @Test
        @DisplayName("企业信息不存在时发布失败")
        void publish_CompanyNotFound_ThrowsException() {
            // Given
            Long userId = 999L;
            JobPublishCmd cmd = new JobPublishCmd();
            cmd.setJobTitle("Java Engineer");

            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> jobAppService.publish(userId, cmd));
            assertEquals("企业信息不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("获取职位详情测试")
    class GetDetailTests {

        @Test
        @DisplayName("成功获取职位详情")
        void getDetail_Success() {
            // Given
            Long jobId = 1L;
            Job job = Job.builder()
                    .id(jobId)
                    .companyId(1L)
                    .jobTitle("Java Engineer")
                    .department("研发部")
                    .headcount(5)
                    .city("北京")
                    .address("朝阳区xxx")
                    .salaryMin(15000)
                    .salaryMax(30000)
                    .salaryUnit("月")
                    .educationRequired("本科")
                    .experienceRequired("3-5年")
                    .jobType("全职")
                    .jobStatus(JobStatus.PUBLISHED)
                    .parseStatus(ParseStatus.SUCCESS)
                    .publishedAt(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .build();
            Company company = Company.builder()
                    .id(1L)
                    .companyName("Test Company")
                    .build();
            JobSkill jobSkill = JobSkill.builder()
                    .id(1L)
                    .jobId(jobId)
                    .skillTagId(1L)
                    .build();
            SkillTag skillTag = SkillTag.builder()
                    .id(1L)
                    .tagName("Java")
                    .category("编程语言")
                    .build();

            when(jobRepository.findByIdOptional(jobId)).thenReturn(Optional.of(job));
            when(companyRepository.findByIdOptional(1L)).thenReturn(Optional.of(company));
            when(jobSkillRepository.findByJobId(jobId)).thenReturn(Arrays.asList(jobSkill));
            when(skillTagRepository.findByIdOptional(1L)).thenReturn(Optional.of(skillTag));

            // When
            JobDetailResponse response = jobAppService.getDetail(jobId);

            // Then
            assertNotNull(response);
            assertEquals(jobId, response.getId());
            assertEquals("Java Engineer", response.getJobTitle());
            assertEquals(1, response.getSkills().size());
            assertEquals("Java", response.getSkills().get(0).getTagName());
        }

        @Test
        @DisplayName("职位不存在时获取失败")
        void getDetail_NotFound_ThrowsException() {
            // Given
            Long jobId = 999L;
            when(jobRepository.findByIdOptional(jobId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> jobAppService.getDetail(jobId));
            assertEquals("职位不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("更新职位测试")
    class UpdateTests {

        @Test
        @DisplayName("成功更新职位")
        void update_Success() {
            // Given
            Long userId = 1L;
            Long jobId = 1L;
            JobUpdateCmd cmd = new JobUpdateCmd();
            cmd.setJobTitle("Senior Java Engineer");
            cmd.setCity("上海");

            Company company = Company.builder()
                    .id(1L)
                    .userId(userId)
                    .build();
            Job existingJob = Job.builder()
                    .id(jobId)
                    .companyId(1L)
                    .jobTitle("Java Engineer")
                    .city("北京")
                    .build();

            when(jobRepository.findByIdOptional(jobId)).thenReturn(Optional.of(existingJob));
            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));
            when(jobRepository.save(any(Job.class))).thenReturn(existingJob);

            // When
            jobAppService.update(userId, jobId, cmd);

            // Then
            ArgumentCaptor<Job> jobCaptor = ArgumentCaptor.forClass(Job.class);
            verify(jobRepository).save(jobCaptor.capture());
            assertEquals("Senior Java Engineer", jobCaptor.getValue().getJobTitle());
            assertEquals("上海", jobCaptor.getValue().getCity());
        }

        @Test
        @DisplayName("无权限修改职位时失败")
        void update_NoPermission_ThrowsException() {
            // Given
            Long userId = 999L;
            Long jobId = 1L;
            JobUpdateCmd cmd = new JobUpdateCmd();
            cmd.setJobTitle("New Title");

            Company company = Company.builder()
                    .id(2L) // Different company
                    .userId(userId)
                    .build();
            Job existingJob = Job.builder()
                    .id(jobId)
                    .companyId(1L)
                    .build();

            when(jobRepository.findByIdOptional(jobId)).thenReturn(Optional.of(existingJob));
            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> jobAppService.update(userId, jobId, cmd));
            assertEquals("无权限修改此职位", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("修改职位状态测试")
    class ChangeStatusTests {

        @Test
        @DisplayName("成功发布职位")
        void changeStatus_Publish_Success() {
            // Given
            Long userId = 1L;
            Long jobId = 1L;
            JobStatus status = JobStatus.PUBLISHED;

            Company company = Company.builder()
                    .id(1L)
                    .userId(userId)
                    .build();
            Job job = Job.builder()
                    .id(jobId)
                    .companyId(1L)
                    .jobStatus(JobStatus.PENDING_REVIEW)
                    .build();

            when(jobRepository.findByIdOptional(jobId)).thenReturn(Optional.of(job));
            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));
            when(jobRepository.save(any(Job.class))).thenReturn(job);

            // When
            jobAppService.changeStatus(userId, jobId, status);

            // Then
            ArgumentCaptor<Job> jobCaptor = ArgumentCaptor.forClass(Job.class);
            verify(jobRepository).save(jobCaptor.capture());
            assertEquals(JobStatus.PUBLISHED, jobCaptor.getValue().getJobStatus());
            assertNotNull(jobCaptor.getValue().getPublishedAt());
        }
    }

    @Nested
    @DisplayName("删除职位测试")
    class DeleteTests {

        @Test
        @DisplayName("成功删除职位")
        void delete_Success() {
            // Given
            Long userId = 1L;
            Long jobId = 1L;

            Company company = Company.builder()
                    .id(1L)
                    .userId(userId)
                    .build();
            Job job = Job.builder()
                    .id(jobId)
                    .companyId(1L)
                    .build();
            List<JobSkill> skills = Arrays.asList(
                    JobSkill.builder().id(1L).jobId(jobId).build()
            );
            List<ParseTask> tasks = Arrays.asList(
                    ParseTask.builder().id(1L).jobId(jobId).build()
            );

            when(jobRepository.findByIdOptional(jobId)).thenReturn(Optional.of(job));
            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));
            when(jobSkillRepository.findByJobId(jobId)).thenReturn(skills);
            when(parseTaskRepository.findByJobId(jobId)).thenReturn(tasks);
            doNothing().when(jobSkillRepository).delete(anyLong());
            doNothing().when(parseTaskRepository).delete(anyLong());
            doNothing().when(jobRepository).delete(jobId);

            // When
            jobAppService.delete(userId, jobId);

            // Then
            verify(jobSkillRepository).delete(1L);
            verify(parseTaskRepository).delete(1L);
            verify(jobRepository).delete(jobId);
        }

        @Test
        @DisplayName("无权限删除职位时失败")
        void delete_NoPermission_ThrowsException() {
            // Given
            Long userId = 999L;
            Long jobId = 1L;

            Company company = Company.builder()
                    .id(2L)
                    .userId(userId)
                    .build();
            Job job = Job.builder()
                    .id(jobId)
                    .companyId(1L)
                    .build();

            when(jobRepository.findByIdOptional(jobId)).thenReturn(Optional.of(job));
            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> jobAppService.delete(userId, jobId));
            assertEquals("无权限删除此职位", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("职位列表测试")
    class ListTests {

        @Test
        @DisplayName("分页查询企业职位列表成功")
        void list_Success() {
            // Given
            Long userId = 1L;
            Integer page = 1;
            Integer pageSize = 10;

            Company company = Company.builder()
                    .id(1L)
                    .userId(userId)
                    .build();
            List<Job> jobs = Arrays.asList(
                    Job.builder().id(1L).jobTitle("Java Engineer").build()
            );

            when(companyRepository.findByUserIdOptional(userId)).thenReturn(Optional.of(company));
            when(jobRepository.findByCompanyId(1L, page, pageSize)).thenReturn(jobs);
            when(jobRepository.countByCompanyId(1L)).thenReturn(1L);

            // When
            PageResult<Job> result = jobAppService.list(userId, page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(1, result.getRecords().size());
            assertEquals(1L, result.getTotal());
        }

        @Test
        @DisplayName("分页查询已发布职位列表成功")
        void listPublished_Success() {
            // Given
            Integer page = 1;
            Integer pageSize = 10;
            List<Job> jobs = Arrays.asList(
                    Job.builder().id(1L).jobTitle("Java Engineer").jobStatus(JobStatus.PUBLISHED).build()
            );

            when(jobRepository.findByJobStatus(JobStatus.PUBLISHED, page, pageSize)).thenReturn(jobs);
            when(jobRepository.countByJobStatus(JobStatus.PUBLISHED)).thenReturn(1L);

            // When
            PageResult<Job> result = jobAppService.listPublished(page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(1, result.getRecords().size());
            assertEquals(1L, result.getTotal());
        }
    }
}
