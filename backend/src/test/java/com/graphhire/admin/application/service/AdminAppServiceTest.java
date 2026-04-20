package com.graphhire.admin.application.service;

import com.graphhire.admin.application.command.AuthCompanyCmd;
import com.graphhire.admin.application.command.DisableUserCmd;
import com.graphhire.admin.application.query.UserListQuery;
import com.graphhire.admin.domain.repository.AdminRepository;
import com.graphhire.admin.domain.service.AdminDomainService;
import com.graphhire.admin.interfaces.dto.response.DashboardStatsResponse;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import com.graphhire.notification.domain.vo.NotificationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
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

    @InjectMocks
    private AdminAppService adminAppService;

    @Nested
    @DisplayName("企业认证测试")
    class AuthCompanyTests {

        @Test
        @DisplayName("认证通过成功")
        void testAuthCompany_Approve() {
            // Given
            Long companyId = 1L;
            AuthCompanyCmd cmd = new AuthCompanyCmd(companyId, true, null);

            Company company = new Company();
            company.setId(companyId);
            company.setName("Test Company");
            company.setAuthStatus(AuthStatus.PENDING_VERIFY);

            when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
            doNothing().when(adminDomainService).validateCompanyAuth(any(), anyBoolean(), any());
            when(adminDomainService.buildAuthNotificationText(any(), anyBoolean(), any()))
                    .thenReturn("您注册的企业「Test Company」已通过认证审核。");
            when(companyRepository.save(any(Company.class))).thenReturn(company);
            when(notificationRepository.save(any(Notification.class))).thenReturn(null);

            // When
            adminAppService.authCompany(companyId, cmd);

            // Then
            ArgumentCaptor<Company> companyCaptor = ArgumentCaptor.forClass(Company.class);
            verify(companyRepository).save(companyCaptor.capture());
            assertEquals(AuthStatus.VERIFIED, companyCaptor.getValue().getAuthStatus());

            ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(notificationCaptor.capture());
            Notification savedNotification = notificationCaptor.getValue();
            assertEquals(NotificationType.SYSTEM_NOTIFICATION, savedNotification.getType());
            assertEquals("企业认证通过", savedNotification.getTitle());
        }

        @Test
        @DisplayName("认证拒绝成功")
        void testAuthCompany_Reject() {
            // Given
            Long companyId = 1L;
            String reason = "信息不完整";
            AuthCompanyCmd cmd = new AuthCompanyCmd(companyId, false, reason);

            Company company = new Company();
            company.setId(companyId);
            company.setName("Test Company");
            company.setAuthStatus(AuthStatus.PENDING_VERIFY);

            when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
            doNothing().when(adminDomainService).validateCompanyAuth(any(), anyBoolean(), any());
            when(adminDomainService.buildAuthNotificationText(any(), anyBoolean(), any()))
                    .thenReturn("您注册的企业「Test Company」未通过认证审核，原因：" + reason);
            when(companyRepository.save(any(Company.class))).thenReturn(company);
            when(notificationRepository.save(any(Notification.class))).thenReturn(null);

            // When
            adminAppService.authCompany(companyId, cmd);

            // Then
            ArgumentCaptor<Company> companyCaptor = ArgumentCaptor.forClass(Company.class);
            verify(companyRepository).save(companyCaptor.capture());
            assertEquals(AuthStatus.REJECTED, companyCaptor.getValue().getAuthStatus());

            ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(notificationCaptor.capture());
            Notification savedNotification = notificationCaptor.getValue();
            assertEquals(NotificationType.SYSTEM_NOTIFICATION, savedNotification.getType());
            assertEquals("企业认证拒绝", savedNotification.getTitle());
        }

        @Test
        @DisplayName("认证不存在的企业失败")
        void testAuthCompany_NotFound() {
            // Given
            Long companyId = 999L;
            AuthCompanyCmd cmd = new AuthCompanyCmd(companyId, true, null);

            when(companyRepository.findById(companyId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> adminAppService.authCompany(companyId, cmd));
            assertEquals("企业不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("禁用用户测试")
    class DisableUserTests {

        @Test
        @DisplayName("禁用用户成功")
        void testDisableUser() {
            // Given
            Long userId = 1L;
            DisableUserCmd cmd = new DisableUserCmd(userId, true);

            User user = new User();
            user.setId(userId);
            user.setStatus(AuthStatus.VERIFIED);

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);

            // When
            adminAppService.disableUser(cmd);

            // Then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals(AuthStatus.DISABLED, userCaptor.getValue().getStatus());
        }

        @Test
        @DisplayName("启用用户成功")
        void testEnableUser() {
            // Given
            Long userId = 1L;
            DisableUserCmd cmd = new DisableUserCmd(userId, false);

            User user = new User();
            user.setId(userId);
            user.setStatus(AuthStatus.DISABLED);

            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);

            // When
            adminAppService.disableUser(cmd);

            // Then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals(AuthStatus.VERIFIED, userCaptor.getValue().getStatus());
        }

        @Test
        @DisplayName("禁用不存在的用户失败")
        void testDisableUser_NotFound() {
            // Given
            Long userId = 999L;
            DisableUserCmd cmd = new DisableUserCmd(userId, true);

            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> adminAppService.disableUser(cmd));
            assertEquals("用户不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("获取用户列表测试")
    class GetUserListTests {

        @Test
        @DisplayName("分页查询用户列表")
        void testGetUserList() {
            // Given
            UserListQuery query = new UserListQuery();
            query.setPage(1);
            query.setPageSize(10);
            query.setUserType("PERSON");
            query.setStatus("1");

            when(adminRepository.findUsersPage(anyInt(), anyInt())).thenReturn(new Page<>(1, 10));

            // When
            List<Long> result = adminAppService.getUserList(query);

            // Then
            // Since AdminMapper is not implemented yet, returns empty list
            assertNotNull(result);
            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("仪表盘统计测试")
    class GetDashboardStatsTests {

        @Test
        @DisplayName("成功获取仪表盘统计数据")
        void testGetDashboardStats_Success() {
            // Given
            when(adminRepository.countPersons()).thenReturn(100L);
            when(adminRepository.countCompanies()).thenReturn(50L);
            when(adminRepository.countResumes()).thenReturn(200L);
            when(adminRepository.countPublishedJobs()).thenReturn(150L);
            when(adminRepository.countMatchRecords()).thenReturn(300L);

            // When
            DashboardStatsResponse response = adminAppService.getDashboardStats();

            // Then
            assertNotNull(response);
            assertEquals(100L, response.getPersonCount());
            assertEquals(50L, response.getCompanyCount());
            assertEquals(200L, response.getResumeCount());
            assertEquals(150L, response.getJobCount());
            assertEquals(300L, response.getMatchCount());

            verify(adminRepository).countPersons();
            verify(adminRepository).countCompanies();
            verify(adminRepository).countResumes();
            verify(adminRepository).countPublishedJobs();
            verify(adminRepository).countMatchRecords();
        }

        @Test
        @DisplayName("所有统计数据为零时成功返回")
        void testGetDashboardStats_AllZeros() {
            // Given
            when(adminRepository.countPersons()).thenReturn(0L);
            when(adminRepository.countCompanies()).thenReturn(0L);
            when(adminRepository.countResumes()).thenReturn(0L);
            when(adminRepository.countPublishedJobs()).thenReturn(0L);
            when(adminRepository.countMatchRecords()).thenReturn(0L);

            // When
            DashboardStatsResponse response = adminAppService.getDashboardStats();

            // Then
            assertNotNull(response);
            assertEquals(0L, response.getPersonCount());
            assertEquals(0L, response.getCompanyCount());
            assertEquals(0L, response.getResumeCount());
            assertEquals(0L, response.getJobCount());
            assertEquals(0L, response.getMatchCount());
        }
    }
}
