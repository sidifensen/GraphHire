package com.graphhire.auth.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.auth.application.command.ForgotPasswordCmd;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.auth.interfaces.dto.request.CompanyRegisterRequest;
import com.graphhire.auth.interfaces.dto.request.LoginRequest;
import com.graphhire.auth.interfaces.dto.request.PersonRegisterRequest;
import com.graphhire.auth.interfaces.dto.request.RefreshTokenRequest;
import com.graphhire.auth.interfaces.dto.response.LoginResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * AuthController 单元测试
 * 测试认证接口：登录、注册、登出、Token校验等
 */
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthAppService authService;

    @InjectMocks
    private AuthController authController;

    @Nested
    @DisplayName("用户登录测试")
    class LoginTests {

        @Test
        @DisplayName("用户登录成功")
        void login_Success() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setUsername("testuser");
            request.setPassword("password123");

            LoginResponse loginResponse = new LoginResponse(
                "token123", null, 86400L, UserType.PERSON, 1L
            );
            when(authService.login("testuser", "password123")).thenReturn(loginResponse);

            // When
            var result = authController.login(request);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals("token123", result.getData().getAccessToken());
            assertEquals(UserType.PERSON, result.getData().getUserType());
            verify(authService).login("testuser", "password123");
        }

        @Test
        @DisplayName("用户登录失败 - 用户不存在")
        void login_UserNotFound() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setUsername("nonexistent");
            request.setPassword("password123");

            when(authService.login("nonexistent", "password123"))
                .thenThrow(new RuntimeException("用户不存在"));

            // When & Then
            assertThrows(RuntimeException.class, () -> authController.login(request));
        }

        @Test
        @DisplayName("用户登录失败 - 密码错误")
        void login_WrongPassword() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setUsername("testuser");
            request.setPassword("wrongpassword");

            when(authService.login("testuser", "wrongpassword"))
                .thenThrow(new RuntimeException("密码错误"));

            // When & Then
            assertThrows(RuntimeException.class, () -> authController.login(request));
        }

        @Test
        @DisplayName("用户登录失败 - 账号已锁定")
        void login_AccountLocked() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setUsername("testuser");
            request.setPassword("password123");

            when(authService.login("testuser", "password123"))
                .thenThrow(new RuntimeException("账号已锁定"));

            // When & Then
            assertThrows(RuntimeException.class, () -> authController.login(request));
        }
    }

    @Nested
    @DisplayName("个人用户注册测试")
    class PersonRegisterTests {

        @Test
        @DisplayName("个人用户注册成功")
        void personRegister_Success() {
            // Given
            PersonRegisterRequest request = new PersonRegisterRequest();
            request.setUsername("newuser@example.com");
            request.setPassword("password123");
            request.setVerifyCode("123456");

            LoginResponse loginResponse = new LoginResponse(
                "token456", null, 86400L, UserType.PERSON, 2L
            );
            when(authService.registerPerson(any())).thenReturn(loginResponse);

            // When
            var result = authController.personRegister(request);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals("token456", result.getData().getAccessToken());
            assertEquals(UserType.PERSON, result.getData().getUserType());
            verify(authService).registerPerson(any());
        }

        @Test
        @DisplayName("个人用户注册失败 - 用户名已存在")
        void personRegister_UsernameExists() {
            // Given
            PersonRegisterRequest request = new PersonRegisterRequest();
            request.setUsername("existinguser@example.com");
            request.setPassword("password123");
            request.setVerifyCode("123456");

            when(authService.registerPerson(any()))
                .thenThrow(new RuntimeException("用户已存在"));

            // When & Then
            assertThrows(RuntimeException.class, () -> authController.personRegister(request));
        }

        @Test
        @DisplayName("个人用户注册失败 - 验证码错误")
        void personRegister_WrongVerifyCode() {
            // Given
            PersonRegisterRequest request = new PersonRegisterRequest();
            request.setUsername("newuser@example.com");
            request.setPassword("password123");
            request.setVerifyCode("wrongcode");

            when(authService.registerPerson(any()))
                .thenThrow(new RuntimeException("验证码错误或已过期"));

            // When & Then
            assertThrows(RuntimeException.class, () -> authController.personRegister(request));
        }
    }

    @Nested
    @DisplayName("企业用户注册测试")
    class CompanyRegisterTests {

        @Test
        @DisplayName("企业用户注册成功")
        void companyRegister_Success() {
            // Given
            CompanyRegisterRequest request = new CompanyRegisterRequest();
            request.setUsername("companyuser@example.com");
            request.setPassword("password123");
            request.setCompanyName("Test Company");
            request.setUnifiedSocialCreditCode("91110000000000001X");
            request.setVerifyCode("123456");

            LoginResponse loginResponse = new LoginResponse(
                "token789", null, 86400L, UserType.COMPANY, 3L
            );
            when(authService.registerCompany(any())).thenReturn(loginResponse);

            // When
            var result = authController.companyRegister(request);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals("token789", result.getData().getAccessToken());
            assertEquals(UserType.COMPANY, result.getData().getUserType());
            verify(authService).registerCompany(any());
        }

        @Test
        @DisplayName("企业用户注册失败 - 用户名已存在")
        void companyRegister_UsernameExists() {
            // Given
            CompanyRegisterRequest request = new CompanyRegisterRequest();
            request.setUsername("existingcompany@example.com");
            request.setPassword("password123");
            request.setCompanyName("Existing Company");
            request.setUnifiedSocialCreditCode("91110000000000002X");
            request.setVerifyCode("123456");

            when(authService.registerCompany(any()))
                .thenThrow(new RuntimeException("用户已存在"));

            // When & Then
            assertThrows(RuntimeException.class, () -> authController.companyRegister(request));
        }
    }

    @Nested
    @DisplayName("管理员登录测试")
    class AdminLoginTests {

        @Test
        @DisplayName("管理员登录成功")
        void adminLogin_Success() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setUsername("admin");
            request.setPassword("admin123");

            LoginResponse loginResponse = new LoginResponse(
                "admin_token123", null, 86400L, UserType.ADMIN, 1L
            );
            when(authService.adminLogin("admin", "admin123")).thenReturn(loginResponse);

            // When
            var result = authController.adminLogin(request);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals("admin_token123", result.getData().getAccessToken());
            assertEquals(UserType.ADMIN, result.getData().getUserType());
            verify(authService).adminLogin("admin", "admin123");
        }

        @Test
        @DisplayName("管理员登录失败 - 非管理员账号")
        void adminLogin_NotAdminAccount() {
            // Given
            LoginRequest request = new LoginRequest();
            request.setUsername("regularuser");
            request.setPassword("password123");

            when(authService.adminLogin("regularuser", "password123"))
                .thenThrow(new RuntimeException("非管理员账号"));

            // When & Then
            assertThrows(RuntimeException.class, () -> authController.adminLogin(request));
        }
    }

    @Nested
    @DisplayName("登出测试")
    class LogoutTests {

        @Test
        @DisplayName("登出成功")
        void logout_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given - StpUtil.logout() is a void method, no need to stub
                // When
                var result = authController.logout();

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                stpUtilMock.verify(StpUtil::logout, times(1));
            }
        }
    }

    @Nested
    @DisplayName("获取当前用户测试")
    class GetCurrentUserTests {

        @Test
        @DisplayName("获取当前登录用户ID成功")
        void getCurrentUser_Success() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                Long userId = 1L;
                stpUtilMock.when(StpUtil::getLoginIdAsLong).thenReturn(userId);

                // When
                var result = authController.getCurrentUser();

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertEquals(userId, result.getData());
            }
        }
    }

    @Nested
    @DisplayName("Token校验测试")
    class ValidateTokenTests {

        @Test
        @DisplayName("Token有效时返回true")
        void validateToken_IsValid() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                stpUtilMock.when(StpUtil::isLogin).thenReturn(true);

                // When
                var result = authController.validateToken();

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertTrue(result.getData());
            }
        }

        @Test
        @DisplayName("Token无效时返回false")
        void validateToken_IsInvalid() {
            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // Given
                stpUtilMock.when(StpUtil::isLogin).thenReturn(false);

                // When
                var result = authController.validateToken();

                // Then
                assertNotNull(result);
                assertEquals(200, result.getCode());
                assertFalse(result.getData());
            }
        }
    }

    @Nested
    @DisplayName("发送验证码测试")
    class SendVerifyCodeTests {

        @Test
        @DisplayName("发送验证码成功（默认类型）")
        void sendVerifyCode_DefaultType_Success() {
            // Given
            String email = "test@example.com";
            doNothing().when(authService).sendVerifyCode(email, "default");

            // When
            var result = authController.sendVerifyCode(email, "default");

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(authService).sendVerifyCode(email, "default");
        }

        @Test
        @DisplayName("发送注册验证码成功")
        void sendVerifyCode_Register_Success() {
            // Given
            String email = "test@example.com";
            String type = "register";
            doNothing().when(authService).sendVerifyCode(email, type);

            // When
            var result = authController.sendVerifyCode(email, type);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(authService).sendVerifyCode(email, "register");
        }

        @Test
        @DisplayName("发送忘记密码验证码成功")
        void sendVerifyCode_ForgotPassword_Success() {
            // Given
            String email = "test@example.com";
            String type = "forgot_password";
            doNothing().when(authService).sendVerifyCode(email, type);

            // When
            var result = authController.sendVerifyCode(email, type);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(authService).sendVerifyCode(email, "forgot_password");
        }
    }

    @Nested
    @DisplayName("忘记密码测试")
    class ForgotPasswordTests {

        @Test
        @DisplayName("忘记密码成功")
        void forgotPassword_Success() {
            // Given
            ForgotPasswordCmd cmd = new ForgotPasswordCmd();
            cmd.setUsername("test@example.com");
            cmd.setVerifyCode("123456");
            cmd.setNewPassword("newPassword123");

            doNothing().when(authService).forgotPassword("test@example.com", "123456", "newPassword123");

            // When
            var result = authController.forgotPassword(cmd);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            verify(authService).forgotPassword("test@example.com", "123456", "newPassword123");
        }

        @Test
        @DisplayName("忘记密码失败 - 用户不存在")
        void forgotPassword_UserNotFound() {
            // Given
            ForgotPasswordCmd cmd = new ForgotPasswordCmd();
            cmd.setUsername("nonexistent@example.com");
            cmd.setVerifyCode("123456");
            cmd.setNewPassword("newPassword123");

            doThrow(new RuntimeException("用户不存在"))
                .when(authService).forgotPassword("nonexistent@example.com", "123456", "newPassword123");

            // When & Then
            assertThrows(RuntimeException.class, () -> authController.forgotPassword(cmd));
        }

        @Test
        @DisplayName("忘记密码失败 - 验证码错误")
        void forgotPassword_WrongVerifyCode() {
            // Given
            ForgotPasswordCmd cmd = new ForgotPasswordCmd();
            cmd.setUsername("test@example.com");
            cmd.setVerifyCode("wrongcode");
            cmd.setNewPassword("newPassword123");

            doThrow(new RuntimeException("验证码错误或已过期"))
                .when(authService).forgotPassword("test@example.com", "wrongcode", "newPassword123");

            // When & Then
            assertThrows(RuntimeException.class, () -> authController.forgotPassword(cmd));
        }
    }

    @Nested
    @DisplayName("重置密码测试（已废弃）")
    class ResetPasswordTests {

        @Test
        @DisplayName("重置密码接口已废弃，使用忘记密码接口")
        void resetPassword_Deprecated() {
            // 注意：reset-password 接口已废弃，统一使用 /forgot-password
            // 此测试仅作文档说明
            assertTrue(true);
        }
    }

    @Nested
    @DisplayName("刷新Token测试")
    class RefreshTokenTests {

        @Test
        @DisplayName("刷新Token成功")
        void refreshToken_Success() {
            // Given
            String refreshToken = "old_refresh_token";
            LoginResponse newLoginResponse = new LoginResponse(
                "new_token", "new_refresh_token", 86400L, UserType.PERSON, 1L
            );
            when(authService.refreshToken(refreshToken)).thenReturn(newLoginResponse);

            // When
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken(refreshToken);
            var result = authController.refreshToken(request, null);

            // Then
            assertNotNull(result);
            assertEquals(200, result.getCode());
            assertNotNull(result.getData());
            assertEquals("new_token", result.getData().getAccessToken());
            assertEquals("new_refresh_token", result.getData().getRefreshToken());
            verify(authService).refreshToken(refreshToken);
        }

        @Test
        @DisplayName("刷新Token失败 - Token无效")
        void refreshToken_InvalidToken() {
            // Given
            String refreshToken = "invalid_refresh_token";
            when(authService.refreshToken(refreshToken))
                .thenThrow(new RuntimeException("Refresh token 无效或已过期"));

            // When & Then
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken(refreshToken);
            assertThrows(RuntimeException.class, () -> authController.refreshToken(request, null));
        }
    }
}
