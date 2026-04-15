package com.graphhire.job.iface.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.auth.domain.vo.EncryptedPassword;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.application.service.JobAppService;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;
import com.graphhire.job.iface.dto.request.CreateStaffRequest;
import com.graphhire.job.iface.dto.request.StatusChangeRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyControllerTest {

    @Mock
    private CompanyAppService companyAppService;

    @Mock
    private JobAppService jobAppService;

    @Mock
    private CompanyStaffRepository companyStaffRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CompanyController companyController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(companyController).build();
    }

    @Nested
    @DisplayName("创建员工账号测试")
    class CreateStaffTests {

        @Test
        @DisplayName("企业主成功创建HR员工")
        void createStaff_AsOwner_CreatesHrSuccess() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long ownerUserId = 1L;
                Long companyId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(ownerUserId);

                CompanyStaff ownerStaff = new CompanyStaff();
                ownerStaff.setId(1L);
                ownerStaff.setUserId(ownerUserId);
                ownerStaff.setCompanyId(companyId);
                ownerStaff.setPost("OWNER");

                when(companyStaffRepository.findByUserId(ownerUserId)).thenReturn(Optional.of(ownerStaff));
                when(userRepository.findByUsername("staff@example.com")).thenReturn(Optional.empty());
                when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                    User user = invocation.getArgument(0);
                    user.setId(2L);
                    return user;
                });
                when(companyStaffRepository.save(any(CompanyStaff.class))).thenAnswer(invocation -> {
                    CompanyStaff staff = invocation.getArgument(0);
                    staff.setId(2L);
                    return staff;
                });

                CreateStaffRequest request = new CreateStaffRequest();
                request.setUsername("staff@example.com");
                request.setPassword("password123");
                request.setPost("HR");

                // When
                var result = companyController.createStaff(request);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(userRepository).save(any(User.class));
                verify(companyStaffRepository).save(any(CompanyStaff.class));
            }
        }

        @Test
        @DisplayName("企业主成功创建招聘专员")
        void createStaff_AsOwner_CreatesRecruiterSuccess() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long ownerUserId = 1L;
                Long companyId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(ownerUserId);

                CompanyStaff ownerStaff = new CompanyStaff();
                ownerStaff.setId(1L);
                ownerStaff.setUserId(ownerUserId);
                ownerStaff.setCompanyId(companyId);
                ownerStaff.setPost("OWNER");

                when(companyStaffRepository.findByUserId(ownerUserId)).thenReturn(Optional.of(ownerStaff));
                when(userRepository.findByUsername("recruiter@example.com")).thenReturn(Optional.empty());
                when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                    User user = invocation.getArgument(0);
                    user.setId(2L);
                    return user;
                });
                when(companyStaffRepository.save(any(CompanyStaff.class))).thenAnswer(invocation -> {
                    CompanyStaff staff = invocation.getArgument(0);
                    staff.setId(2L);
                    return staff;
                });

                CreateStaffRequest request = new CreateStaffRequest();
                request.setUsername("recruiter@example.com");
                request.setPassword("password123");
                request.setPost("RECRUITER");

                // When
                var result = companyController.createStaff(request);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(userRepository).save(any(User.class));
                verify(companyStaffRepository).save(any(CompanyStaff.class));
            }
        }

        @Test
        @DisplayName("非企业用户创建员工失败")
        void createStaff_NotCompanyUser_ThrowsException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                when(companyStaffRepository.findByUserId(userId)).thenReturn(Optional.empty());

                CreateStaffRequest request = new CreateStaffRequest();
                request.setUsername("staff@example.com");
                request.setPassword("password123");
                request.setPost("HR");

                // When & Then
                assertThrows(Exception.class, () -> companyController.createStaff(request));
            }
        }

        @Test
        @DisplayName("HR用户尝试创建员工失败")
        void createStaff_AsHr_ThrowsForbiddenException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long hrUserId = 2L;
                Long companyId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(hrUserId);

                CompanyStaff hrStaff = new CompanyStaff();
                hrStaff.setId(2L);
                hrStaff.setUserId(hrUserId);
                hrStaff.setCompanyId(companyId);
                hrStaff.setPost("HR");

                when(companyStaffRepository.findByUserId(hrUserId)).thenReturn(Optional.of(hrStaff));

                CreateStaffRequest request = new CreateStaffRequest();
                request.setUsername("staff@example.com");
                request.setPassword("password123");
                request.setPost("HR");

                // When & Then
                assertThrows(Exception.class, () -> companyController.createStaff(request));
            }
        }

        @Test
        @DisplayName("招聘专员尝试创建员工失败")
        void createStaff_AsRecruiter_ThrowsForbiddenException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long recruiterUserId = 3L;
                Long companyId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(recruiterUserId);

                CompanyStaff recruiterStaff = new CompanyStaff();
                recruiterStaff.setId(3L);
                recruiterStaff.setUserId(recruiterUserId);
                recruiterStaff.setCompanyId(companyId);
                recruiterStaff.setPost("RECRUITER");

                when(companyStaffRepository.findByUserId(recruiterUserId)).thenReturn(Optional.of(recruiterStaff));

                CreateStaffRequest request = new CreateStaffRequest();
                request.setUsername("staff@example.com");
                request.setPassword("password123");
                request.setPost("HR");

                // When & Then
                assertThrows(Exception.class, () -> companyController.createStaff(request));
            }
        }

        @Test
        @DisplayName("用户名已存在时创建失败")
        void createStaff_UsernameExists_ThrowsException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long ownerUserId = 1L;
                Long companyId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(ownerUserId);

                CompanyStaff ownerStaff = new CompanyStaff();
                ownerStaff.setId(1L);
                ownerStaff.setUserId(ownerUserId);
                ownerStaff.setCompanyId(companyId);
                ownerStaff.setPost("OWNER");

                User existingUser = new User();
                existingUser.setId(2L);

                when(companyStaffRepository.findByUserId(ownerUserId)).thenReturn(Optional.of(ownerStaff));
                when(userRepository.findByUsername("existing@example.com")).thenReturn(Optional.of(existingUser));

                CreateStaffRequest request = new CreateStaffRequest();
                request.setUsername("existing@example.com");
                request.setPassword("password123");
                request.setPost("HR");

                // When & Then
                assertThrows(Exception.class, () -> companyController.createStaff(request));
            }
        }

        @Test
        @DisplayName("无效职位创建失败")
        void createStaff_InvalidPost_ThrowsException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long ownerUserId = 1L;
                Long companyId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(ownerUserId);

                CompanyStaff ownerStaff = new CompanyStaff();
                ownerStaff.setId(1L);
                ownerStaff.setUserId(ownerUserId);
                ownerStaff.setCompanyId(companyId);
                ownerStaff.setPost("OWNER");

                when(companyStaffRepository.findByUserId(ownerUserId)).thenReturn(Optional.of(ownerStaff));

                CreateStaffRequest request = new CreateStaffRequest();
                request.setUsername("staff@example.com");
                request.setPassword("password123");
                request.setPost("INVALID_POST");

                // When & Then
                assertThrows(Exception.class, () -> companyController.createStaff(request));
            }
        }

        @Test
        @DisplayName("密码已BCrypt加密")
        void createStaff_PasswordIsBCryptEncoded() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long ownerUserId = 1L;
                Long companyId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(ownerUserId);

                CompanyStaff ownerStaff = new CompanyStaff();
                ownerStaff.setId(1L);
                ownerStaff.setUserId(ownerUserId);
                ownerStaff.setCompanyId(companyId);
                ownerStaff.setPost("OWNER");

                when(companyStaffRepository.findByUserId(ownerUserId)).thenReturn(Optional.of(ownerStaff));
                when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
                when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                    User user = invocation.getArgument(0);
                    user.setId(2L);
                    return user;
                });
                when(companyStaffRepository.save(any(CompanyStaff.class))).thenAnswer(invocation -> {
                    CompanyStaff staff = invocation.getArgument(0);
                    staff.setId(2L);
                    return staff;
                });

                CreateStaffRequest request = new CreateStaffRequest();
                request.setUsername("staff@example.com");
                request.setPassword("plainPassword123");
                request.setPost("HR");

                // When
                companyController.createStaff(request);

                // Then - verify password is BCrypt encoded (starts with $2)
                verify(userRepository).save(argThat(user ->
                    user.getPassword().getValue().startsWith("$2")
                ));
            }
        }
    }

    @Nested
    @DisplayName("获取企业信息测试")
    class GetCompanyInfoTests {

        @Test
        @DisplayName("成功获取当前用户企业信息")
        void getCompanyInfo_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long companyId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                Company company = new Company();
                company.setId(companyId);
                company.setName("Test Company");

                when(companyAppService.getCompanyByUserId(userId)).thenReturn(company);

                // When
                var result = companyController.getCompanyInfo();

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertEquals(company, result.getData());
                verify(companyAppService).getCompanyByUserId(userId);
            }
        }
    }

    @Nested
    @DisplayName("职位列表测试")
    class ListJobsTests {

        @Test
        @DisplayName("成功获取企业职位列表")
        void listJobs_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long companyId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);

                Job job1 = new Job();
                job1.setId(1L);
                job1.setTitle("Java Engineer");
                Job job2 = new Job();
                job2.setId(2L);
                job2.setTitle("Python Engineer");

                when(jobAppService.getJobsByCompany(companyId)).thenReturn(Arrays.asList(job1, job2));

                // When
                var result = companyController.listJobs();

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertEquals(2, result.getData().size());
                verify(jobAppService).getJobsByCompany(companyId);
            }
        }
    }

    @Nested
    @DisplayName("获取职位详情测试")
    class GetJobTests {

        @Test
        @DisplayName("成功获取职位详情")
        void getJob_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long companyId = 1L;
                Long jobId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);

                Job job = new Job();
                job.setId(jobId);
                job.setCompanyId(companyId);
                job.setTitle("Java Engineer");

                when(jobAppService.getJobById(jobId)).thenReturn(job);

                // When
                var result = companyController.getJob(jobId);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertEquals(job, result.getData());
            }
        }

        @Test
        @DisplayName("无权查看其他企业职位时抛出异常")
        void getJob_NoPermission_ThrowsException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long companyId = 1L;
                Long otherCompanyId = 2L;
                Long jobId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);

                Job job = new Job();
                job.setId(jobId);
                job.setCompanyId(otherCompanyId); // Different company

                when(jobAppService.getJobById(jobId)).thenReturn(job);

                // When & Then
                assertThrows(Exception.class, () -> companyController.getJob(jobId));
            }
        }
    }

    @Nested
    @DisplayName("职位状态切换测试")
    class ToggleJobStatusTests {

        @Test
        @DisplayName("成功发布职位")
        void toggleJobStatus_Publish_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long companyId = 1L;
                Long jobId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);

                Job job = new Job();
                job.setId(jobId);
                job.setCompanyId(companyId);
                job.setStatus(JobStatus.DRAFT);

                when(jobAppService.getJobById(jobId)).thenReturn(job);
                when(jobAppService.publishJob(eq(jobId), isNull())).thenReturn(job);

                StatusChangeRequest request = new StatusChangeRequest();
                request.setPublish(true);

                // When
                var result = companyController.toggleJobStatus(jobId, request);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(jobAppService).publishJob(eq(jobId), isNull());
            }
        }

        @Test
        @DisplayName("成功关闭职位")
        void toggleJobStatus_Close_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long companyId = 1L;
                Long jobId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);

                Job job = new Job();
                job.setId(jobId);
                job.setCompanyId(companyId);
                job.setStatus(JobStatus.PUBLISHED);

                when(jobAppService.getJobById(jobId)).thenReturn(job);
                when(jobAppService.closeJob(jobId)).thenReturn(job);

                StatusChangeRequest request = new StatusChangeRequest();
                request.setPublish(false);

                // When
                var result = companyController.toggleJobStatus(jobId, request);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(jobAppService).closeJob(jobId);
            }
        }

        @Test
        @DisplayName("无权操作其他企业职位时抛出异常")
        void toggleJobStatus_NoPermission_ThrowsException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long companyId = 1L;
                Long otherCompanyId = 2L;
                Long jobId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);

                Job job = new Job();
                job.setId(jobId);
                job.setCompanyId(otherCompanyId); // Different company

                when(jobAppService.getJobById(jobId)).thenReturn(job);

                StatusChangeRequest request = new StatusChangeRequest();
                request.setPublish(true);

                // When & Then
                assertThrows(Exception.class, () -> companyController.toggleJobStatus(jobId, request));
            }
        }
    }
}
