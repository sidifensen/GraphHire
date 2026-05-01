package com.graphhire.job.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.auth.domain.vo.EncryptedPassword;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.application.application.service.ApplicationAppService;
import com.graphhire.application.domain.repository.ApplicationRepository;
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
import com.graphhire.job.interfaces.dto.request.CreateStaffRequest;
import com.graphhire.job.interfaces.dto.request.SalaryUpdateRequest;
import com.graphhire.job.interfaces.dto.request.StatusChangeRequest;
import com.graphhire.job.interfaces.dto.response.CompanyAvatarUrlResolver;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.match.interfaces.dto.response.MatchDetailResponse;
import com.graphhire.config.UploadProperties;
import com.graphhire.resume.infrastructure.file.RustFSClient;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.util.unit.DataSize;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
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

    @Mock
    private MatchAppService matchAppService;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private MatchRecordRepository matchRecordRepository;

    @Mock
    private SkillGraphClient skillGraphClient;

    @Mock
    private ApplicationAppService applicationAppService;

    @Mock
    private RustFSClient rustFSClient;

    @Mock
    private CompanyAvatarUrlResolver companyAvatarUrlResolver;

    @Mock
    private StringRedisTemplate stringRedisTemplate;
    @Mock
    private UploadProperties uploadProperties;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private CompanyController companyController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(companyController).build();
        lenient().when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        UploadProperties.Avatar avatar = new UploadProperties.Avatar();
        avatar.setMaxFileSize(DataSize.ofMegabytes(2));
        lenient().when(uploadProperties.getAvatar()).thenReturn(avatar);
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
        @DisplayName("企业主使用非HR职位创建失败")
        void createStaff_AsOwner_CreatesNonHr_ThrowsValidationException() {
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
                request.setUsername("recruiter@example.com");
                request.setPassword("password123");
                request.setPost("RECRUITER");

                // When & Then
                assertThrows(Exception.class, () -> companyController.createStaff(request));
                verify(userRepository, never()).save(any(User.class));
                verify(companyStaffRepository, never()).save(any(CompanyStaff.class));
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
        @DisplayName("成功获取当前用户企业信息并返回头像地址")
        void getCompanyInfo_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long companyId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                Company company = new Company();
                company.setId(companyId);
                company.setName("Test Company");
                company.setAvatarPath("avatar/1987654321098767360.png");

                when(companyAppService.getCompanyByUserId(userId)).thenReturn(company);
                when(companyAvatarUrlResolver.resolve("avatar/1987654321098767360.png"))
                        .thenReturn("http://localhost:9000/resumes/avatar/1987654321098767360.png");

                // When
                var result = companyController.getCompanyInfo();

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertEquals(companyId, result.getData().id());
                assertEquals("Test Company", result.getData().name());
                assertEquals("http://localhost:9000/resumes/avatar/1987654321098767360.png", result.getData().avatarUrl());
                verify(companyAppService).getCompanyByUserId(userId);
            }
        }

        @Test
        @DisplayName("待加入成员访问企业信息应被拒绝")
        void getCompanyInfo_PendingJoin_ShouldThrow() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                Long userId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                CompanyStaff pendingStaff = new CompanyStaff();
                pendingStaff.setUserId(userId);
                pendingStaff.setCompanyId(100L);
                pendingStaff.setPost("HR");
                pendingStaff.setStatus(CompanyStaff.STATUS_PENDING_JOIN);
                when(companyStaffRepository.findByUserId(userId)).thenReturn(Optional.of(pendingStaff));

                assertThrows(Exception.class, () -> companyController.getCompanyInfo());
                verify(companyAppService, never()).getCompanyByUserId(anyLong());
            }
        }
    }

    @Nested
    @DisplayName("企业头像上传测试")
    class UploadAvatarTests {

        @Test
        @DisplayName("上传企业头像成功")
        void uploadAvatar_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                Long userId = 1L;
                Long companyId = 10L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);
                when(rustFSClient.upload(any(byte[].class), anyString())).thenReturn("s3://resumes/avatar/1987654321098767360.png");
                when(companyAvatarUrlResolver.resolve(matches("avatar/\\d+\\.png")))
                        .thenReturn("http://localhost:9000/resumes/avatar/1987654321098767360.png");

                MockMultipartFile file = new MockMultipartFile(
                        "file",
                        "logo.png",
                        "image/png",
                        "avatar".getBytes(StandardCharsets.UTF_8)
                );

                var result = companyController.uploadAvatar(file);

                assertEquals(200, result.getCode());
                assertEquals("http://localhost:9000/resumes/avatar/1987654321098767360.png", result.getData());
                verify(rustFSClient).upload(any(byte[].class), matches("avatar/\\d+\\.png"));
                verify(companyAppService).updateCompanyAvatarPath(eq(companyId), matches("avatar/\\d+\\.png"));
            }
        }

        @Test
        @DisplayName("上传非图片企业头像失败")
        void uploadAvatar_WhenNotImage_ShouldThrow() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(1L);

                MockMultipartFile file = new MockMultipartFile(
                        "file",
                        "logo.txt",
                        "text/plain",
                        "avatar".getBytes(StandardCharsets.UTF_8)
                );

                assertThrows(RuntimeException.class, () -> companyController.uploadAvatar(file));
                verify(rustFSClient, never()).upload(any(byte[].class), anyString());
            }
        }

        @Test
        @DisplayName("上传超限企业头像失败")
        void uploadAvatar_WhenTooLarge_ShouldThrow() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(1L);

                MockMultipartFile file = new MockMultipartFile(
                        "file",
                        "logo.png",
                        "image/png",
                        new byte[(2 * 1024 * 1024) + 1]
                );

                assertThrows(RuntimeException.class, () -> companyController.uploadAvatar(file));
                verify(rustFSClient, never()).upload(any(byte[].class), anyString());
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
                Company company = new Company();
                company.setId(companyId);
                company.setAuthStatus(AuthStatus.VERIFIED);
                when(companyAppService.getCompanyById(companyId)).thenReturn(company);

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

    @Nested
    @DisplayName("发布职位测试")
    class PublishJobTests {

        @Test
        @DisplayName("成功发布职位")
        void publishJob_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long companyId = 1L;
                Long jobId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);
                Company company = new Company();
                company.setId(companyId);
                company.setAuthStatus(AuthStatus.VERIFIED);
                when(companyAppService.getCompanyById(companyId)).thenReturn(company);

                Job job = new Job();
                job.setId(jobId);
                job.setCompanyId(companyId);
                job.setStatus(JobStatus.DRAFT);

                when(jobAppService.getJobById(jobId)).thenReturn(job);
                when(jobAppService.publishJob(eq(jobId), isNull())).thenReturn(job);

                // When
                var result = companyController.publishJob(jobId);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(jobAppService).publishJob(eq(jobId), isNull());
            }
        }

        @Test
        @DisplayName("无权发布他人职位时抛出异常")
        void publishJob_NoPermission_ThrowsException() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                Long companyId = 1L;
                Long otherCompanyId = 2L;
                Long jobId = 1L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);
                Company company = new Company();
                company.setId(companyId);
                company.setAuthStatus(AuthStatus.VERIFIED);
                when(companyAppService.getCompanyById(companyId)).thenReturn(company);

                Job job = new Job();
                job.setId(jobId);
                job.setCompanyId(otherCompanyId);

                when(jobAppService.getJobById(jobId)).thenReturn(job);

                // When & Then
                assertThrows(Exception.class, () -> companyController.publishJob(jobId));
            }
        }
    }

    @Nested
    @DisplayName("关闭职位测试")
    class CloseJobTests {

        @Test
        @DisplayName("成功关闭职位")
        void closeJob_Success() {
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

                // When
                var result = companyController.closeJob(jobId);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(jobAppService).closeJob(jobId);
            }
        }
    }

    @Nested
    @DisplayName("更新薪资测试")
    class UpdateSalaryTests {

        @Test
        @DisplayName("成功更新薪资")
        void updateSalary_Success() {
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

                when(jobAppService.getJobById(jobId)).thenReturn(job);
                when(jobAppService.updateSalary(eq(jobId), any(SalaryRange.class))).thenReturn(job);

                SalaryUpdateRequest request = new SalaryUpdateRequest();
                request.setMin(5000);
                request.setMax(10000);
                request.setUnit("月");

                // When
                var result = companyController.updateSalary(jobId, request);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(jobAppService).updateSalary(eq(jobId), any(SalaryRange.class));
            }
        }
    }

    @Nested
    @DisplayName("删除职位测试")
    class DeleteJobTests {

        @Test
        @DisplayName("成功删除职位")
        void deleteJob_Success() {
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

                when(jobAppService.getJobById(jobId)).thenReturn(job);
                doNothing().when(jobAppService).deleteJob(jobId);

                // When
                var result = companyController.deleteJob(jobId);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(jobAppService).deleteJob(jobId);
            }
        }
    }

    @Nested
    @DisplayName("创建公司测试")
    class CreateCompanyTests {

        @Test
        @DisplayName("成功创建公司")
        void createCompany_Success() {
            // Given
            String name = "New Company";
            String unifiedSocialCreditCode = "91110000000000001X";

            Company company = new Company();
            company.setId(1L);
            company.setName(name);

            when(companyAppService.createCompany(eq(name), eq(unifiedSocialCreditCode),
                isNull(), isNull(), isNull(), isNull())).thenReturn(company);

            // When
            var result = companyController.createCompany(name, unifiedSocialCreditCode,
                null, null, null, null);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            assertEquals(1L, result.getData());
            verify(companyAppService).createCompany(eq(name), eq(unifiedSocialCreditCode),
                isNull(), isNull(), isNull(), isNull());
        }
    }

    @Nested
    @DisplayName("获取公司测试")
    class GetCompanyTests {

        @Test
        @DisplayName("成功获取公司详情")
        void getCompany_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 9L;
                Long companyId = 1L;
                Company company = new Company();
                company.setId(companyId);
                company.setName("Test Company");
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);
                when(companyAppService.getCompanyById(companyId)).thenReturn(company);

                // When
                var result = companyController.getCompany(companyId);

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertEquals(companyId, result.getData().getId());
                assertEquals("Test Company", result.getData().getName());
            }
        }

        @Test
        @DisplayName("查看其他企业详情时抛出无权限异常")
        void getCompany_OtherCompany_ThrowsForbidden() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                Long userId = 9L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(1L);
                assertThrows(Exception.class, () -> companyController.getCompany(2L));
            }
        }
    }

    @Nested
    @DisplayName("员工状态管理测试")
    class UpdateStaffStatusTests {
        @Test
        @DisplayName("企业主成功禁用员工")
        void updateStaffStatus_DisableSuccess() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(1L);
                CompanyStaff owner = new CompanyStaff();
                owner.setUserId(1L);
                owner.setCompanyId(100L);
                owner.setPost("OWNER");
                CompanyStaff target = new CompanyStaff();
                target.setId(2L);
                target.setUserId(2L);
                target.setCompanyId(100L);
                target.setPost("HR");

                when(companyStaffRepository.findByUserId(1L)).thenReturn(Optional.of(owner));
                when(companyStaffRepository.findById(2L)).thenReturn(Optional.of(target));
                when(companyStaffRepository.save(any(CompanyStaff.class))).thenAnswer(invocation -> invocation.getArgument(0));

                var result = companyController.updateStaffStatus(2L, true);
                assertEquals(200, result.getCode());
                verify(companyStaffRepository).save(argThat(s -> CompanyStaff.STATUS_DISABLED.equals(s.getStatus())));
            }
        }
    }

    @Nested
    @DisplayName("推荐面试邀请测试")
    class InviteInterviewTests {
        @Test
        @DisplayName("推荐页可按简历+职位触发面试邀请")
        void inviteInterviewByResume_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(1L);
                when(companyAppService.getCompanyIdByUserId(1L)).thenReturn(100L);
                doReturn(null).when(applicationAppService)
                        .sendInterviewInvitationByResume(eq(100L), eq(11L), eq(22L), any(), any(), any());

                Map<String, String> body = new java.util.HashMap<>();
                body.put("resumeId", "11");
                body.put("jobId", "22");
                body.put("location", "会议室A");
                body.put("remark", "请准时参加");

                var result = companyController.inviteInterviewByResume(body);
                assertEquals(200, result.getCode());
                verify(applicationAppService).sendInterviewInvitationByResume(eq(100L), eq(11L), eq(22L), any(), eq("会议室A"), eq("请准时参加"));
            }
        }
    }

    @Nested
    @DisplayName("岗位一键匹配测试")
    class TriggerMatchForJobTests {

        @Test
        @DisplayName("企业可触发指定岗位全量匹配")
        void triggerMatchForJob_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                Long userId = 1L;
                Long companyId = 10L;
                Long jobId = 101L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);

                Job job = new Job();
                job.setId(jobId);
                job.setCompanyId(companyId);
                when(jobAppService.getJobById(jobId)).thenReturn(job);
                when(valueOperations.setIfAbsent(eq("match:job:trigger:" + jobId), eq("1"), any(Duration.class))).thenReturn(true);

                var result = companyController.triggerMatchForJob(jobId);

                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(matchAppService).triggerMatchForJob(jobId);
                verify(stringRedisTemplate).delete("match:job:trigger:" + jobId);
            }
        }

        @Test
        @DisplayName("同一岗位重复触发时应忽略")
        void triggerMatchForJob_WhenLocked_ShouldIgnore() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                Long userId = 1L;
                Long companyId = 10L;
                Long jobId = 101L;

                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);
                when(companyAppService.getCompanyIdByUserId(userId)).thenReturn(companyId);

                Job job = new Job();
                job.setId(jobId);
                job.setCompanyId(companyId);
                when(jobAppService.getJobById(jobId)).thenReturn(job);
                when(valueOperations.setIfAbsent(eq("match:job:trigger:" + jobId), eq("1"), any(Duration.class))).thenReturn(false);

                var result = companyController.triggerMatchForJob(jobId);

                assertNotNull(result);
                assertEquals(200, result.getCode());
                verify(matchAppService, never()).triggerMatchForJob(jobId);
            }
        }
    }
}
