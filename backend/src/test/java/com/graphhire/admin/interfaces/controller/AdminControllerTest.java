package com.graphhire.admin.interfaces.controller;

import com.graphhire.admin.application.command.AuthCompanyCmd;
import com.graphhire.admin.application.command.DisableUserCmd;
import com.graphhire.admin.application.query.UserListQuery;
import com.graphhire.admin.application.service.AdminAppService;
import com.graphhire.admin.interfaces.dto.response.DashboardStatsResponse;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.auth.interfaces.dto.request.LoginRequest;
import com.graphhire.auth.interfaces.dto.response.LoginResponse;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;
import com.graphhire.resume.interfaces.dto.ResumeVO;
import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.vo.SkillCategory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * AdminController 单元测试
 * 测试管理员操作接口：登录、仪表盘统计、企业认证、用户管理、列表查询等
 */
@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private AdminAppService adminAppService;

    @Mock
    private AuthAppService authAppService;

    @InjectMocks
    private AdminController adminController;

    @Nested
    @DisplayName("管理员登录测试")
    class AdminLoginTests {

        @Test
        @DisplayName("管理员登录成功")
        void adminLogin_Success() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setUsername("admin");
            request.setPassword("password123");

            LoginResponse loginResponse = new LoginResponse(
                "token123", null, 86400L, UserType.ADMIN, 1L
            );
            when(authAppService.adminLogin("admin", "password123")).thenReturn(loginResponse);

            // When
            var result = adminController.adminLogin(request);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals("token123", result.getData().getAccessToken());
            assertEquals(UserType.ADMIN, result.getData().getUserType());
            verify(authAppService).adminLogin("admin", "password123");
        }

        @Test
        @DisplayName("管理员登录失败 - 用户不存在")
        void adminLogin_UserNotFound() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setUsername("nonexistent");
            request.setPassword("password123");

            when(authAppService.adminLogin("nonexistent", "password123"))
                .thenThrow(new RuntimeException("用户不存在"));

            // When & Then
            assertThrows(RuntimeException.class, () -> adminController.adminLogin(request));
        }

        @Test
        @DisplayName("管理员登录失败 - 密码错误")
        void adminLogin_WrongPassword() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setUsername("admin");
            request.setPassword("wrongpassword");

            when(authAppService.adminLogin("admin", "wrongpassword"))
                .thenThrow(new RuntimeException("密码错误"));

            // When & Then
            assertThrows(RuntimeException.class, () -> adminController.adminLogin(request));
        }

        @Test
        @DisplayName("管理员登录失败 - 非管理员账号")
        void adminLogin_NotAdminAccount() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setUsername("regularuser");
            request.setPassword("password123");

            when(authAppService.adminLogin("regularuser", "password123"))
                .thenThrow(new RuntimeException("非管理员账号"));

            // When & Then
            assertThrows(RuntimeException.class, () -> adminController.adminLogin(request));
        }
    }

    @Nested
    @DisplayName("仪表盘统计测试")
    class DashboardStatsTests {

        @Test
        @DisplayName("成功获取仪表盘统计数据")
        void getDashboardStats_Success() {
            // Given
            DashboardStatsResponse statsResponse = new DashboardStatsResponse(
                100L, 50L, 200L, 150L, 300L
            );
            when(adminAppService.getDashboardStats()).thenReturn(statsResponse);

            // When
            var result = adminController.getDashboardStats();

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals(100L, result.getData().getPersonCount());
            assertEquals(50L, result.getData().getCompanyCount());
            assertEquals(200L, result.getData().getResumeCount());
            assertEquals(150L, result.getData().getJobCount());
            assertEquals(300L, result.getData().getMatchCount());
            verify(adminAppService).getDashboardStats();
        }
    }

    @Nested
    @DisplayName("企业认证测试")
    class AuthCompanyTests {

        @Test
        @DisplayName("审批通过企业成功")
        void authCompany_Approve_Success() {
            // Given
            Long companyId = 1L;
            AuthCompanyCmd cmd = new AuthCompanyCmd(companyId, true, null);

            doNothing().when(adminAppService).authCompany(eq(companyId), any(AuthCompanyCmd.class));

            // When
            var result = adminController.authCompany(companyId, cmd);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(adminAppService).authCompany(eq(companyId), any(AuthCompanyCmd.class));
        }

        @Test
        @DisplayName("拒绝企业成功")
        void authCompany_Reject_Success() {
            // Given
            Long companyId = 1L;
            AuthCompanyCmd cmd = new AuthCompanyCmd(companyId, false, "材料不全");

            doNothing().when(adminAppService).authCompany(eq(companyId), any(AuthCompanyCmd.class));

            // When
            var result = adminController.authCompany(companyId, cmd);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(adminAppService).authCompany(eq(companyId), any(AuthCompanyCmd.class));
        }

        @Test
        @DisplayName("企业不存在时抛出异常")
        void authCompany_CompanyNotFound_ThrowsException() {
            // Given
            Long companyId = 999L;
            AuthCompanyCmd cmd = new AuthCompanyCmd(companyId, true, null);

            doThrow(new RuntimeException("企业不存在"))
                .when(adminAppService).authCompany(eq(companyId), any(AuthCompanyCmd.class));

            // When & Then
            assertThrows(RuntimeException.class, () -> adminController.authCompany(companyId, cmd));
        }

        @Test
        @DisplayName("只能审批待审核企业")
        void authCompany_NotPending_ThrowsException() {
            // Given
            Long companyId = 1L;
            AuthCompanyCmd cmd = new AuthCompanyCmd(companyId, true, null);

            doThrow(new IllegalStateException("只能审批待审核的企业"))
                .when(adminAppService).authCompany(eq(companyId), any(AuthCompanyCmd.class));

            // When & Then
            assertThrows(IllegalStateException.class, () -> adminController.authCompany(companyId, cmd));
        }
    }

    @Nested
    @DisplayName("用户状态管理测试")
    class UserStatusTests {

        @Test
        @DisplayName("禁用用户成功")
        void modifyUserStatus_Disable_Success() {
            // Given
            Long userId = 1L;
            boolean enabled = false;

            doNothing().when(adminAppService).modifyUserStatus(userId, enabled);

            // When
            var result = adminController.modifyUserStatus(userId, enabled);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(adminAppService).modifyUserStatus(userId, enabled);
        }

        @Test
        @DisplayName("启用用户成功")
        void modifyUserStatus_Enable_Success() {
            // Given
            Long userId = 1L;
            boolean enabled = true;

            doNothing().when(adminAppService).modifyUserStatus(userId, enabled);

            // When
            var result = adminController.modifyUserStatus(userId, enabled);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(adminAppService).modifyUserStatus(userId, enabled);
        }

        @Test
        @DisplayName("禁用不存在的用户抛出异常")
        void modifyUserStatus_UserNotFound_ThrowsException() {
            // Given
            Long userId = 999L;
            boolean enabled = false;

            doThrow(new RuntimeException("用户不存在"))
                .when(adminAppService).modifyUserStatus(userId, enabled);

            // When & Then
            assertThrows(RuntimeException.class, () -> adminController.modifyUserStatus(userId, enabled));
        }

        @Test
        @DisplayName("禁用用户命令成功")
        void disableUser_Success() {
            // Given
            DisableUserCmd cmd = new DisableUserCmd(1L, true);

            doNothing().when(adminAppService).disableUser(any(DisableUserCmd.class));

            // When
            var result = adminController.disableUser(cmd);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(adminAppService).disableUser(any(DisableUserCmd.class));
        }
    }

    @Nested
    @DisplayName("用户列表查询测试")
    class UserListTests {

        @Test
        @DisplayName("分页查询用户列表成功")
        void getUserList_Success() {
            // Given
            UserListQuery query = new UserListQuery(1, 20, "PERSON", "VERIFIED");
            List<Long> userIds = Arrays.asList(1L, 2L, 3L);
            when(adminAppService.getUserList(any(UserListQuery.class))).thenReturn(userIds);

            // When
            var result = adminController.getUserList(query);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals(3, result.getData().size());
            verify(adminAppService).getUserList(any(UserListQuery.class));
        }
    }

    @Nested
    @DisplayName("简历列表查询测试")
    class ResumeListTests {

        @Test
        @DisplayName("分页查询简历列表成功")
        void getResumeList_Success() {
            // Given
            int page = 1;
            int size = 10;
            com.graphhire.common.vo.PageResult<?> mockPageResult =
                new com.graphhire.common.vo.PageResult<>(java.util.Arrays.asList(), 0L, page, size);
            doReturn(mockPageResult).when(adminAppService).getResumeList(page, size);

            // When
            var result = adminController.getResumeList(page, size);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(adminAppService).getResumeList(page, size);
        }
    }

    @Nested
    @DisplayName("职位列表查询测试")
    class JobListTests {

        @Test
        @DisplayName("分页查询职位列表成功")
        void getJobList_Success() {
            // Given
            int page = 1;
            int size = 10;
            com.graphhire.common.vo.PageResult<com.graphhire.job.domain.model.Job> mockPageResult =
                new com.graphhire.common.vo.PageResult<>(Arrays.asList(), 0L, page, size);
            when(adminAppService.getJobList(page, size)).thenReturn(mockPageResult);

            // When
            var result = adminController.getJobList(page, size);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(adminAppService).getJobList(page, size);
        }
    }

    @Nested
    @DisplayName("技能标签列表查询测试")
    class SkillListTests {

        @Test
        @DisplayName("查询技能标签列表成功")
        void getSkillList_Success() {
            // Given
            SkillTag skill1 = new SkillTag("Java", SkillCategory.PROGRAMMING_LANGUAGE);
            skill1.setId(1L);
            SkillTag skill2 = new SkillTag("Spring", SkillCategory.FRAMEWORK);
            skill2.setId(2L);
            List<SkillTag> skillList = java.util.Arrays.asList(skill1, skill2);
            when(adminAppService.getSkillList()).thenReturn(skillList);

            // When
            var result = adminController.getSkillList();

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals(2, ((List<?>)result.getData()).size());
            verify(adminAppService).getSkillList();
        }
    }

    @Nested
    @DisplayName("企业审批测试")
    class CompanyApprovalTests {

        @Test
        @DisplayName("审批通过公司成功")
        void approveCompany_Success() {
            // Given
            Long companyId = 1L;

            doNothing().when(adminAppService).approveCompany(companyId);

            // When
            var result = adminController.approveCompany(companyId);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(adminAppService).approveCompany(companyId);
        }

        @Test
        @DisplayName("拒绝公司成功")
        void rejectCompany_Success() {
            // Given
            Long companyId = 1L;

            doNothing().when(adminAppService).rejectCompany(companyId);

            // When
            var result = adminController.rejectCompany(companyId);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(adminAppService).rejectCompany(companyId);
        }

        @Test
        @DisplayName("获取待审批公司列表成功")
        void getPendingCompanies_Success() {
            // Given
            Company company1 = createCompany(1L, "Company A");
            Company company2 = createCompany(2L, "Company B");
            when(adminAppService.getPendingCompanies()).thenReturn(Arrays.asList(company1, company2));

            // When
            var result = adminController.getPendingCompanies();

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals(2, ((List<?>)result.getData()).size());
            verify(adminAppService).getPendingCompanies();
        }

        @Test
        @DisplayName("根据认证状态获取公司列表成功")
        void getCompaniesByAuthStatus_Success() {
            // Given
            Integer authStatus = 0; // PENDING_VERIFY
            Company company = createCompany(1L, "Pending Company");
            when(adminAppService.getCompaniesByAuthStatus(authStatus)).thenReturn(Arrays.asList(company));

            // When
            var result = adminController.getCompaniesByAuthStatus(authStatus);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(adminAppService).getCompaniesByAuthStatus(authStatus);
        }
    }

    @Nested
    @DisplayName("获取企业认证列表测试")
    class CompanyAuthListTests {

        @Test
        @DisplayName("获取认证列表成功")
        void getCompanyAuthList_Success() {
            // Given
            Company company1 = createCompany(1L, "Company A");
            Company company2 = createCompany(2L, "Company B");
            when(adminAppService.getCompanyAuthList()).thenReturn(Arrays.asList(company1, company2));

            // When
            var result = adminController.getCompanyAuthList();

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(adminAppService).getCompanyAuthList();
        }
    }

    /**
     * 创建测试用 Company 对象
     */
    private Company createCompany(Long id, String name) {
        Company company = new Company();
        company.setId(id);
        company.setName(name);
        company.setUnifiedSocialCreditCode("91110000" + id);
        company.setContactName("Contact Person");
        company.setContactPhone("13800000000");
        company.setContactEmail("contact@" + name + ".com");
        return company;
    }
}