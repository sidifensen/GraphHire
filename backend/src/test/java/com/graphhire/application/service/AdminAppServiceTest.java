package com.graphhire.application.service;

import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.Company;
import com.graphhire.domain.model.Job;
import com.graphhire.domain.model.Notification;
import com.graphhire.domain.model.ParseTask;
import com.graphhire.domain.model.Resume;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.JobRepository;
import com.graphhire.domain.repository.NotificationRepository;
import com.graphhire.domain.repository.ParseTaskRepository;
import com.graphhire.domain.repository.ResumeRepository;
import com.graphhire.domain.repository.UserRepository;
import com.graphhire.domain.vo.AuthStatus;
import com.graphhire.domain.vo.JobStatus;
import com.graphhire.domain.vo.NotificationType;
import com.graphhire.domain.vo.UserType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAppServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ParseTaskRepository parseTaskRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private AdminAppService adminAppService;

    @Nested
    @DisplayName("用户列表测试")
    class ListUsersTests {

        @Test
        @DisplayName("分页查询用户列表成功")
        void listUsers_Success() {
            // Given
            String keyword = "test";
            UserType userType = UserType.PERSON;
            Integer page = 1;
            Integer pageSize = 10;

            List<User> users = Arrays.asList(
                    User.builder().id(1L).username("user1").build(),
                    User.builder().id(2L).username("user2").build()
            );

            when(userRepository.findByKeyword(keyword, userType, page, pageSize)).thenReturn(users);
            when(userRepository.countByKeyword(keyword, userType)).thenReturn(2L);

            // When
            PageResult<User> result = adminAppService.listUsers(keyword, userType, page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(2, result.getRecords().size());
            assertEquals(2L, result.getTotal());
            assertEquals(1, result.getPage());
            assertEquals(10, result.getPageSize());
            assertEquals(1, result.getTotalPages());
        }
    }

    @Nested
    @DisplayName("启用/禁用用户测试")
    class UserStatusTests {

        @Test
        @DisplayName("成功启用用户")
        void enableUser_Success() {
            // Given
            Long userId = 1L;
            User user = User.builder()
                    .id(userId)
                    .username("testuser")
                    .status(0)
                    .build();

            when(userRepository.findByIdOptional(userId)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);

            // When
            adminAppService.enableUser(userId);

            // Then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals(1, userCaptor.getValue().getStatus());
        }

        @Test
        @DisplayName("启用不存在的用户失败")
        void enableUser_NotFound_ThrowsException() {
            // Given
            Long userId = 999L;
            when(userRepository.findByIdOptional(userId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> adminAppService.enableUser(userId));
            assertEquals("用户不存在", exception.getMessage());
        }

        @Test
        @DisplayName("成功禁用用户")
        void disableUser_Success() {
            // Given
            Long userId = 1L;
            User user = User.builder()
                    .id(userId)
                    .username("testuser")
                    .status(1)
                    .build();

            when(userRepository.findByIdOptional(userId)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);

            // When
            adminAppService.disableUser(userId);

            // Then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals(0, userCaptor.getValue().getStatus());
        }
    }

    @Nested
    @DisplayName("待认证企业列表测试")
    class ListPendingCompaniesTests {

        @Test
        @DisplayName("分页查询待认证企业成功")
        void listPendingCompanies_Success() {
            // Given
            Integer page = 1;
            Integer pageSize = 10;
            List<Company> companies = Arrays.asList(
                    Company.builder().id(1L).companyName("Company A").build(),
                    Company.builder().id(2L).companyName("Company B").build()
            );

            when(companyRepository.findByAuthStatus(AuthStatus.PENDING, page, pageSize)).thenReturn(companies);
            when(companyRepository.countByAuthStatus(AuthStatus.PENDING)).thenReturn(2L);

            // When
            PageResult<Company> result = adminAppService.listPendingCompanies(page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(2, result.getRecords().size());
        }
    }

    @Nested
    @DisplayName("企业认证测试")
    class AuthCompanyTests {

        @Test
        @DisplayName("认证通过成功")
        void authCompany_Approved_Success() {
            // Given
            Long companyId = 1L;
            Company company = Company.builder()
                    .id(companyId)
                    .userId(10L)
                    .companyName("Test Company")
                    .authStatus(AuthStatus.PENDING)
                    .build();

            when(companyRepository.findByIdOptional(companyId)).thenReturn(Optional.of(company));
            when(companyRepository.save(any(Company.class))).thenReturn(company);
            when(notificationRepository.save(any(Notification.class))).thenReturn(null);

            // When
            adminAppService.authCompany(companyId, true, null);

            // Then
            ArgumentCaptor<Company> companyCaptor = ArgumentCaptor.forClass(Company.class);
            verify(companyRepository).save(companyCaptor.capture());
            assertEquals(AuthStatus.APPROVED, companyCaptor.getValue().getAuthStatus());

            ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(notificationCaptor.capture());
            assertEquals(NotificationType.COMPANY_AUTH_RESULT, notificationCaptor.getValue().getType());
            assertEquals("企业认证通过", notificationCaptor.getValue().getTitle());
        }

        @Test
        @DisplayName("认证拒绝成功")
        void authCompany_Rejected_Success() {
            // Given
            Long companyId = 1L;
            String reason = "信息不完整";
            Company company = Company.builder()
                    .id(companyId)
                    .userId(10L)
                    .companyName("Test Company")
                    .authStatus(AuthStatus.PENDING)
                    .build();

            when(companyRepository.findByIdOptional(companyId)).thenReturn(Optional.of(company));
            when(companyRepository.save(any(Company.class))).thenReturn(company);
            when(notificationRepository.save(any(Notification.class))).thenReturn(null);

            // When
            adminAppService.authCompany(companyId, false, reason);

            // Then
            ArgumentCaptor<Company> companyCaptor = ArgumentCaptor.forClass(Company.class);
            verify(companyRepository).save(companyCaptor.capture());
            assertEquals(AuthStatus.REJECTED, companyCaptor.getValue().getAuthStatus());
            assertEquals(reason, companyCaptor.getValue().getAuthReason());
        }

        @Test
        @DisplayName("认证不存在的企业失败")
        void authCompany_NotFound_ThrowsException() {
            // Given
            Long companyId = 999L;
            when(companyRepository.findByIdOptional(companyId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> adminAppService.authCompany(companyId, true, null));
            assertEquals("企业不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("简历列表测试")
    class ListResumesTests {

        @Test
        @DisplayName("分页查询简历列表成功")
        void listResumes_Success() {
            // Given
            String keyword = "java";
            Integer page = 1;
            Integer pageSize = 10;
            List<Resume> resumes = Arrays.asList(
                    Resume.builder().id(1L).fileName("resume1.pdf").build()
            );

            when(resumeRepository.findByKeyword(keyword, page, pageSize)).thenReturn(resumes);
            when(resumeRepository.countByKeyword(keyword)).thenReturn(1L);

            // When
            PageResult<Resume> result = adminAppService.listResumes(keyword, page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(1, result.getRecords().size());
        }
    }

    @Nested
    @DisplayName("职位列表测试")
    class ListJobsTests {

        @Test
        @DisplayName("分页查询职位列表成功")
        void listJobs_Success() {
            // Given
            String keyword = "engineer";
            Integer page = 1;
            Integer pageSize = 10;
            List<Job> jobs = Arrays.asList(
                    Job.builder().id(1L).jobTitle("Java Engineer").build()
            );

            when(jobRepository.findByKeyword(keyword, page, pageSize)).thenReturn(jobs);
            when(jobRepository.countByKeyword(keyword)).thenReturn(1L);

            // When
            PageResult<Job> result = adminAppService.listJobs(keyword, page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(1, result.getRecords().size());
        }
    }

    @Nested
    @DisplayName("删除简历测试")
    class DeleteResumeTests {

        @Test
        @DisplayName("成功删除简历及关联任务")
        void deleteResume_Success() {
            // Given
            Long resumeId = 1L;
            List<ParseTask> tasks = Arrays.asList(
                    ParseTask.builder().id(1L).resumeId(resumeId).build()
            );

            when(parseTaskRepository.findByResumeId(resumeId)).thenReturn(tasks);
            doNothing().when(parseTaskRepository).delete(anyLong());
            doNothing().when(resumeRepository).delete(resumeId);

            // When
            adminAppService.deleteResume(resumeId);

            // Then
            verify(parseTaskRepository).delete(1L);
            verify(resumeRepository).delete(resumeId);
        }
    }

    @Nested
    @DisplayName("删除职位测试")
    class DeleteJobTests {

        @Test
        @DisplayName("成功删除职位及关联任务")
        void deleteJob_Success() {
            // Given
            Long jobId = 1L;
            List<ParseTask> tasks = Arrays.asList(
                    ParseTask.builder().id(1L).jobId(jobId).build()
            );

            when(parseTaskRepository.findByJobId(jobId)).thenReturn(tasks);
            doNothing().when(parseTaskRepository).delete(anyLong());
            doNothing().when(jobRepository).delete(jobId);

            // When
            adminAppService.deleteJob(jobId);

            // Then
            verify(parseTaskRepository).delete(1L);
            verify(jobRepository).delete(jobId);
        }
    }

    @Nested
    @DisplayName("仪表盘统计测试")
    class DashboardStatsTests {

        @Test
        @DisplayName("获取仪表盘统计数据成功")
        void getDashboardStats_Success() {
            // Given
            when(userRepository.countAll()).thenReturn(100L);
            when(userRepository.countByUserType(UserType.PERSON)).thenReturn(70L);
            when(userRepository.countByUserType(UserType.COMPANY)).thenReturn(30L);
            when(resumeRepository.countAll()).thenReturn(50L);
            when(jobRepository.countAll()).thenReturn(40L);
            when(jobRepository.countByJobStatus(JobStatus.PUBLISHED)).thenReturn(35L);
            when(companyRepository.countByAuthStatus(AuthStatus.PENDING)).thenReturn(5L);
            when(parseTaskRepository.countPending()).thenReturn(10L);

            // When
            Map<String, Object> stats = adminAppService.getDashboardStats();

            // Then
            assertNotNull(stats);
            assertEquals(100L, stats.get("totalUsers"));
            assertEquals(70L, stats.get("totalPersons"));
            assertEquals(30L, stats.get("totalCompanies"));
            assertEquals(50L, stats.get("totalResumes"));
            assertEquals(40L, stats.get("totalJobs"));
            assertEquals(35L, stats.get("publishedJobs"));
            assertEquals(5L, stats.get("pendingCompanies"));
            assertEquals(10L, stats.get("pendingParseTasks"));
        }
    }
}
