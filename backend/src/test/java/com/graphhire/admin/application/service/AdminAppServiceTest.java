package com.graphhire.admin.application.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.graphhire.admin.application.command.AuthCompanyCmd;
import com.graphhire.admin.application.query.UserListQuery;
import com.graphhire.admin.domain.repository.AdminRepository;
import com.graphhire.admin.domain.service.AdminDomainService;
import com.graphhire.admin.interfaces.dto.response.*;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.auth.domain.vo.Username;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.interfaces.dto.response.CompanyAvatarUrlResolver;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.resume.application.service.ResumeAppService;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.resume.domain.vo.ParseStatus;
import com.graphhire.skill.application.service.SkillTagAppService;
import com.graphhire.skill.domain.model.SkillTag;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAppServiceTest {

    @Mock
    private AdminRepository adminRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AdminDomainService adminDomainService;
    @Mock
    private ResumeAppService resumeAppService;
    @Mock
    private ParseTaskRepository parseTaskRepository;
    @Mock
    private SkillTagAppService skillTagAppService;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private PersonInfoRepository personInfoRepository;
    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private CompanyAppService companyAppService;
    @Mock
    private CompanyAvatarUrlResolver companyAvatarUrlResolver;

    @InjectMocks
    private AdminAppService adminAppService;

    @Nested
    @DisplayName("仪表盘")
    class DashboardTests {
        @Test
        @DisplayName("返回新统计字段")
        void getDashboardStatsSuccess() {
            when(adminRepository.countPersons()).thenReturn(10L);
            when(adminRepository.countCompanies()).thenReturn(3L);
            when(adminRepository.countResumes()).thenReturn(20L);
            when(adminRepository.countPublishedJobs()).thenReturn(7L);
            when(adminRepository.countMatchRecords()).thenReturn(100L);
            when(adminRepository.countPersonsCreatedBetween(any(), any())).thenReturn(4L, 2L, 1L);
            when(adminRepository.countCompaniesCreatedBetween(any(), any())).thenReturn(2L, 1L, 1L);
            when(adminRepository.countResumesCreatedBetween(any(), any())).thenReturn(8L, 4L);
            when(adminRepository.countJobsCreatedBetween(any(), any())).thenReturn(6L, 3L, 2L);
            when(adminRepository.countMatchRecordsCreatedBetween(any(), any())).thenReturn(12L, 6L);
            when(adminRepository.countPersonsLastLoginBetween(any(), any())).thenReturn(5L);
            when(companyRepository.countByAuthStatus(AuthStatus.PENDING_VERIFY)).thenReturn(2L);
            when(skillTagAppService.getAllSkillTags()).thenReturn(List.of(buildSkill("Java", 20), buildSkill("Python", 10)));
            when(resumeRepository.findByParseStatus(ParseStatus.SUCCESS)).thenReturn(List.of(
                buildDefaultResumeWithSkills(List.of("Java", "Python", "MySQL")),
                buildDefaultResumeWithSkills(List.of("Java", "Redis")),
                buildNonDefaultResumeWithSkills(List.of("Go"))
            ));
            when(companyRepository.findByAuthStatus(AuthStatus.PENDING_VERIFY)).thenReturn(List.of(buildCompany(1L, "待审企业", AuthStatus.PENDING_VERIFY, LocalDateTime.now().minusHours(2))));
            when(companyRepository.findByAuthStatus(AuthStatus.VERIFIED)).thenReturn(List.of(buildCompany(2L, "已审企业", AuthStatus.VERIFIED, LocalDateTime.now().minusHours(1))));
            when(companyRepository.findByAuthStatus(AuthStatus.REJECTED)).thenReturn(List.of());

            ParseTask pending = new ParseTask();
            pending.setStatus(ParseTask.TaskStatus.PENDING);
            pending.setCreatedAt(LocalDateTime.now().minusHours(3));
            ParseTask running = new ParseTask();
            running.setStatus(ParseTask.TaskStatus.RUNNING);
            running.setCreatedAt(LocalDateTime.now().minusHours(2));
            ParseTask success = new ParseTask();
            success.setStatus(ParseTask.TaskStatus.SUCCESS);
            success.setCreatedAt(LocalDateTime.now().minusHours(1));
            success.setCompletedAt(LocalDateTime.now().minusMinutes(50));
            ParseTask failed = new ParseTask();
            failed.setStatus(ParseTask.TaskStatus.FAILED);
            failed.setCreatedAt(LocalDateTime.now().minusMinutes(40));
            failed.setErrorMessage("timeout");
            when(parseTaskRepository.findAll()).thenReturn(List.of(pending, running, success, failed));

            DashboardStatsResponse response = adminAppService.getDashboardStats();

            assertEquals(10L, response.getTotalUsers());
            assertEquals(3L, response.getTotalCompanies());
            assertEquals(2L, response.getPendingCompanyAudit());
            assertEquals(2L, response.getPendingTaskCount());
            assertEquals(1L, response.getFailedTaskCount());
            assertEquals(100L, response.getMatchCount());
            assertEquals(4L, response.getTodayNewUsers());
            assertEquals(6L, response.getTodayNewJobs());
            assertEquals(100.0, response.getUserGrowthRate());
            assertEquals(0.0, response.getCompanyGrowthRate());
            assertEquals(100.0, response.getResumeGrowthRate());
            assertEquals(50.0, response.getJobGrowthRate());
            assertEquals(100.0, response.getMatchGrowthRate());
            assertEquals(100.0, response.getMatchConversionRate());
            assertEquals(5L, response.getDailyActiveUsers());
            assertNotNull(response.getUpdatedAt());
            assertNotNull(response.getTrend());
            assertFalse(response.getTrend().isEmpty());
            assertNotNull(response.getActiveOverview());
            assertEquals(3, response.getTodos().size());
            assertFalse(response.getHotSkills().isEmpty());
            assertEquals("Java", response.getHotSkills().get(0).getName());
            assertEquals(100, response.getHotSkills().get(0).getHeat());
            assertFalse(response.getSystemActivities().isEmpty());
        }

        @Test
        @DisplayName("趋势支持日周月维度切换")
        void getDashboardTrendByDimension() {
            when(adminRepository.countPersonsLastLoginBetween(any(), any())).thenReturn(1L);
            when(adminRepository.countMatchRecordsCreatedBetween(any(), any())).thenReturn(2L);

            List<DashboardStatsResponse.TrendPoint> dayTrend = adminAppService.getDashboardTrend("DAY");
            List<DashboardStatsResponse.TrendPoint> weekTrend = adminAppService.getDashboardTrend("WEEK");
            List<DashboardStatsResponse.TrendPoint> monthTrend = adminAppService.getDashboardTrend("MONTH");

            assertEquals(30, dayTrend.size());
            assertEquals(12, weekTrend.size());
            assertEquals(12, monthTrend.size());
        }
    }

    private SkillTag buildSkill(String name, int usageCount) {
        SkillTag skillTag = new SkillTag(name);
        skillTag.setUsageCount(usageCount);
        skillTag.setCreateTime(LocalDateTime.now().minusDays(1));
        skillTag.setUpdateTime(LocalDateTime.now().minusHours(1));
        return skillTag;
    }

    private Company buildCompany(Long id, String name, AuthStatus status, LocalDateTime updateTime) {
        Company company = new Company();
        company.setId(id);
        company.setName(name);
        company.setAuthStatus(status);
        company.setCreateTime(updateTime.minusDays(1));
        company.setUpdatedAt(updateTime);
        return company;
    }

    private Resume buildDefaultResumeWithSkills(List<String> skills) {
        Resume resume = new Resume();
        resume.setIsDefault(true);
        resume.setStatus(ParseStatus.SUCCESS);
        resume.setParseResult("{\"skills\":" + toJsonArray(skills) + "}");
        return resume;
    }

    private Resume buildNonDefaultResumeWithSkills(List<String> skills) {
        Resume resume = new Resume();
        resume.setIsDefault(false);
        resume.setStatus(ParseStatus.SUCCESS);
        resume.setParseResult("{\"skills\":" + toJsonArray(skills) + "}");
        return resume;
    }

    private String toJsonArray(List<String> values) {
        return values.stream().map(v -> "\"" + v + "\"").collect(java.util.stream.Collectors.joining(",", "[", "]"));
    }

    @Nested
    @DisplayName("企业审核")
    class CompanyAuthTests {
        @Test
        @DisplayName("企业审核通过")
        void authCompanyApproveSuccess() {
            Company company = new Company();
            company.setId(1L);
            company.setUserId(99L);
            company.setName("A");
            company.setAuthStatus(AuthStatus.PENDING_VERIFY);
            when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
            when(adminDomainService.buildAuthNotificationText(any(), anyBoolean(), any())).thenReturn("ok");

            adminAppService.authCompany(1L, new AuthCompanyCmd(1L, true, null));

            verify(companyRepository).save(any(Company.class));
            ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(notificationCaptor.capture());
            Notification saved = notificationCaptor.getValue();
            assertEquals(99L, saved.getUserId());
            assertEquals(NotificationType.COMPANY_AUTH_RESULT, saved.getType());
            assertEquals("企业认证通过", saved.getTitle());
        }

        @Test
        @DisplayName("企业审核分页列表")
        void getCompanyAuthListSuccess() {
            Company c1 = new Company();
            c1.setId(1L);
            c1.setName("星河科技");
            c1.setUnifiedSocialCreditCode("911");
            c1.setAvatarPath("avatar/company-1.png");
            c1.setContactName("张三");
            c1.setContactPhone("138");
            c1.setLicenseUrl("/a.png");
            c1.setAuthStatus(AuthStatus.PENDING_VERIFY);
            c1.setUserId(100L);

            User owner = new User();
            owner.setId(100L);
            owner.setUsername(Username.of("owner@graphhire.com"));

            when(companyRepository.findByAuthStatus(AuthStatus.PENDING_VERIFY)).thenReturn(List.of(c1));
            when(companyAvatarUrlResolver.resolve("avatar/company-1.png")).thenReturn("https://cdn.example.com/company-1.png");
            when(userRepository.findById(100L)).thenReturn(Optional.of(owner));

            AdminPageResponse<AdminCompanyAuthItemResponse> page = adminAppService.getCompanyAuthList("PENDING", "星河", 1, 10);

            assertEquals(1, page.getTotal());
            assertEquals("星河科技", page.getList().get(0).getCompanyName());
            assertEquals("https://cdn.example.com/company-1.png", page.getList().get(0).getAvatarUrl());
            assertEquals("owner@graphhire.com", page.getList().get(0).getOwnerName());
            assertEquals("PENDING", page.getList().get(0).getStatus());
        }

        @Test
        @DisplayName("批量拒绝")
        void batchRejectCompanySuccess() {
            adminAppService.batchRejectCompany(List.of(1L, 2L), "材料不完整");
            verify(companyAppService).rejectCompany(1L);
            verify(companyAppService).rejectCompany(2L);
        }
    }

    @Nested
    @DisplayName("用户")
    class UserTests {
        @Test
        @DisplayName("用户分页返回结构")
        void getUserListSuccess() {
            User user = new User();
            user.setId(1L);
            user.setUsername(Username.of("alice@test.com"));
            user.setUserType(UserType.PERSON);
            user.setStatus(AuthStatus.VERIFIED);
            user.setCreateTime(LocalDateTime.of(2026, 4, 20, 10, 0));
            user.setLastLoginTime(LocalDateTime.of(2026, 4, 22, 18, 30));
            Page<User> p = new Page<>(1, 10, 1);
            p.setRecords(List.of(user));
            when(adminRepository.findUsersPage(1, 10)).thenReturn(p);
            PersonInfo personInfo = new PersonInfo();
            personInfo.setRealName("Alice");
            personInfo.setPhone("13800000000");
            personInfo.setAvatarUrl("https://cdn.example.com/avatar/alice.png");
            when(personInfoRepository.findByUserId(1L)).thenReturn(Optional.of(personInfo));

            UserListQuery query = new UserListQuery();
            query.setPage(1);
            query.setPageSize(10);
            query.setKeyword("alice");
            AdminPageResponse<AdminUserItemResponse> page = adminAppService.getUserList(query);

            assertEquals(1, page.getTotal());
            assertEquals("alice@test.com", page.getList().get(0).getUsername());
            assertEquals("ACTIVE", page.getList().get(0).getStatus());
            assertEquals("Alice", page.getList().get(0).getRealName());
            assertEquals("13800000000", page.getList().get(0).getPhone());
            assertEquals("https://cdn.example.com/avatar/alice.png", page.getList().get(0).getAvatarUrl());
            assertEquals("2026-04-22 18:30:00", page.getList().get(0).getLastLoginAt());
        }

        @Test
        @DisplayName("获取用户详情返回完整信息与personInfo")
        void getUserDetailSuccess() {
            User user = new User();
            user.setId(9L);
            user.setUsername(Username.of("detail@test.com"));
            user.setUserType(UserType.PERSON);
            user.setStatus(AuthStatus.VERIFIED);
            user.setCreateTime(LocalDateTime.of(2026, 4, 18, 9, 15));
            user.setLastLoginTime(LocalDateTime.of(2026, 4, 23, 23, 10));
            when(userRepository.findById(9L)).thenReturn(Optional.of(user));

            PersonInfo personInfo = new PersonInfo();
            personInfo.setId(88L);
            personInfo.setUserId(9L);
            personInfo.setRealName("张三");
            personInfo.setGender(1);
            personInfo.setAge(27);
            personInfo.setPhone("13900001111");
            personInfo.setEducation("本科");
            personInfo.setCity("上海");
            personInfo.setTargetCity("杭州");
            personInfo.setExpectedSalary(30000);
            personInfo.setAvatarUrl("https://cdn.example.com/avatar/zs.png");
            when(personInfoRepository.findByUserId(9L)).thenReturn(Optional.of(personInfo));

            AdminUserDetailResponse detail = adminAppService.getUserDetail(9L);

            assertNotNull(detail.getUser());
            assertEquals(9L, detail.getUser().getId());
            assertEquals("detail@test.com", detail.getUser().getUsername());
            assertEquals("detail@test.com", detail.getUser().getEmail());
            assertEquals("13900001111", detail.getUser().getPhone());
            assertEquals("2026-04-18 09:15:00", detail.getUser().getCreatedAt());
            assertEquals("2026-04-23 23:10:00", detail.getUser().getLastLoginAt());
            assertEquals("张三", detail.getUser().getRealName());
            assertEquals("https://cdn.example.com/avatar/zs.png", detail.getUser().getAvatarUrl());

            assertNotNull(detail.getPersonInfo());
            assertEquals(88L, detail.getPersonInfo().getId());
            assertEquals(9L, detail.getPersonInfo().getUserId());
            assertEquals("张三", detail.getPersonInfo().getRealName());
            assertEquals("13900001111", detail.getPersonInfo().getPhone());
        }

        @Test
        @DisplayName("更新用户状态为禁用")
        void modifyUserStatusSuccess() {
            User user = new User();
            user.setId(1L);
            user.setStatus(AuthStatus.VERIFIED);
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));

            adminAppService.modifyUserStatus(1L, "DISABLED");

            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertEquals(AuthStatus.DISABLED, captor.getValue().getStatus());
        }

        @Test
        @DisplayName("批量禁用用户")
        void batchDisableUserSuccess() {
            User u1 = new User();
            u1.setId(1L);
            User u2 = new User();
            u2.setId(2L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(u1));
            when(userRepository.findById(2L)).thenReturn(Optional.of(u2));

            adminAppService.batchDisableUser(List.of(1L, 2L));

            verify(userRepository, times(2)).save(any(User.class));
        }
    }

    @Nested
    @DisplayName("技能")
    class SkillTests {
        @Test
        @DisplayName("技能分页")
        void getSkillListSuccess() {
            SkillTag javaSkill = new SkillTag("Java");
            javaSkill.setId(1L);
            javaSkill.setUsageCount(12);
            javaSkill.setSynonyms(java.util.Set.of("javase"));
            when(skillTagAppService.getAllSkillTags()).thenReturn(List.of(javaSkill));

            AdminPageResponse<AdminSkillItemResponse> page = adminAppService.getSkillList(null, "Java", 1, 10);

            assertEquals(1, page.getTotal());
            assertEquals("Java", page.getList().get(0).getName());
            assertEquals(12, page.getList().get(0).getJobCount());
        }
    }

    @Nested
    @DisplayName("任务")
    class TaskTests {
        @Test
        @DisplayName("任务分页+summary")
        void getTaskListSuccess() {
            ParseTask task = new ParseTask();
            task.setId(10L);
            task.setTaskType("resume_parse");
            task.setStatus(ParseTask.TaskStatus.FAILED);
            task.setResumeId(88L);
            task.setRetryCount(1);
            task.setCreatedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now().plusMinutes(1));
            task.setErrorMessage("timeout");
            IPage<ParseTask> page = new Page<>(1, 10, 1);
            page.setRecords(List.of(task));
            when(parseTaskRepository.findPage("RESUME_PARSE", "FAILED", 1, 10)).thenReturn(page);
            when(parseTaskRepository.countByStatus(ParseTask.TaskStatus.PENDING)).thenReturn(0L);
            when(parseTaskRepository.countByStatus(ParseTask.TaskStatus.RUNNING)).thenReturn(0L);
            when(parseTaskRepository.countByStatus(ParseTask.TaskStatus.SUCCESS)).thenReturn(0L);
            when(parseTaskRepository.countByStatus(ParseTask.TaskStatus.FAILED)).thenReturn(1L);

            AdminTaskListResponse response = adminAppService.getTaskList("RESUME_PARSE", "FAILED", 1, 10);

            assertEquals(1, response.getTotal());
            assertEquals(1, response.getSummary().getFailed());
            assertEquals("FAILED", response.getList().get(0).getStatus());
            assertEquals("RESUME_PARSE", response.getList().get(0).getType());
            assertEquals(88L, response.getList().get(0).getSourceId());
            assertNotNull(response.getList().get(0).getUpdatedAt());
            verify(parseTaskRepository, never()).findAll();
        }

        @Test
        @DisplayName("单任务重试")
        void retryTaskSuccess() {
            ParseTask task = new ParseTask();
            task.setId(10L);
            task.setStatus(ParseTask.TaskStatus.FAILED);
            when(parseTaskRepository.findById(10L)).thenReturn(Optional.of(task));

            adminAppService.retryTask(10L);

            verify(parseTaskRepository).save(any(ParseTask.class));
        }

        @Test
        @DisplayName("批量任务重试")
        void batchRetryTaskSuccess() {
            ParseTask task = new ParseTask();
            task.setId(10L);
            task.setStatus(ParseTask.TaskStatus.FAILED);
            when(parseTaskRepository.findById(10L)).thenReturn(Optional.of(task));

            adminAppService.batchRetryTask(List.of(10L));

            verify(parseTaskRepository).save(any(ParseTask.class));
        }
    }

    @Nested
    @DisplayName("批量通过公司")
    class BatchApproveTests {
        @Test
        @DisplayName("调用企业服务")
        void batchApproveCompanySuccess() {
            adminAppService.batchApproveCompany(List.of(1L, 2L));
            verify(companyAppService).approveCompany(1L);
            verify(companyAppService).approveCompany(2L);
        }
    }
}
