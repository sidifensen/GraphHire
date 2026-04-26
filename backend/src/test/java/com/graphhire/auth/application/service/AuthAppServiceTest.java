package com.graphhire.auth.application.service;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.auth.application.command.CompanyRegisterCmd;
import com.graphhire.auth.application.command.PersonRegisterCmd;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.auth.domain.vo.EncryptedPassword;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.auth.domain.vo.Username;
import com.graphhire.auth.infrastructure.mail.MailService;
import com.graphhire.common.vo.Exceptions;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mail.MailSendException;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * AuthAppService 单元测试
 * 测试认证服务：登录、注册、验证码、忘记密码等
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthAppServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private MailService mailService;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CompanyStaffRepository companyStaffRepository;

    @InjectMocks
    private AuthAppService authAppService;

    private void setupRedisMock() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(valueOperations.setIfAbsent(anyString(), anyString(), anyLong(), any(TimeUnit.class)))
            .thenReturn(true);
        lenient().when(valueOperations.increment(anyString())).thenReturn(1L);
        lenient().when(redisTemplate.hasKey(anyString())).thenReturn(false);
    }

    private void mockStpUtil() {
        // StpUtil static mock - 空调用，不验证具体行为
    }

    @Nested
    @DisplayName("发送验证码测试")
    class SendVerifyCodeTests {

        @Test
        @DisplayName("发送注册验证码成功")
        void sendVerifyCode_Register_Success() {
            // Given
            setupRedisMock();
            String email = "test@example.com";
            String type = "register";

            // When
            authAppService.sendVerifyCode(email, type);

            // Then
            verify(valueOperations).set(
                eq("email_code:" + email + ":" + type),
                argThat(code -> code != null && code.length() == 6),
                eq(15L),
                eq(TimeUnit.MINUTES)
            );
            verify(mailService, timeout(500)).sendVerifyCodeMail(
                eq(email),
                eq("【GraphHire】您的验证码"),
                argThat(content -> content.contains("验证码是：") && content.contains("15分钟内有效"))
            );
        }

        @Test
        @DisplayName("发送忘记密码验证码成功")
        void sendVerifyCode_ForgotPassword_Success() {
            // Given
            setupRedisMock();
            String email = "test@example.com";
            String type = "forgot_password";

            // When
            authAppService.sendVerifyCode(email, type);

            // Then
            verify(valueOperations).set(
                eq("email_code:" + email + ":" + type),
                anyString(),
                eq(15L),
                eq(TimeUnit.MINUTES)
            );
            verify(mailService, timeout(500)).sendVerifyCodeMail(eq(email), anyString(), anyString());
        }

        @Test
        @DisplayName("发送验证码失败 - 邮件发送异常时不应阻塞主流程")
        void sendVerifyCode_MailSendFailed_ShouldNotThrowBusinessException() {
            // Given
            setupRedisMock();
            String email = "test@example.com";
            String type = "register";
            doThrow(new MailSendException("smtp timeout")).when(mailService)
                .sendVerifyCodeMail(eq(email), anyString(), anyString());

            // When
            assertDoesNotThrow(() -> authAppService.sendVerifyCode(email, type));

            // Then
            verify(valueOperations, timeout(500)).set(
                eq("email_code:" + email + ":" + type),
                anyString(),
                eq(15L),
                eq(TimeUnit.MINUTES)
            );
        }

        @Test
        @DisplayName("发送验证码重复请求 - 冷却期内应直接返回成功")
        void sendVerifyCode_DuringCooldown_ShouldReturnSilently() {
            // Given
            setupRedisMock();
            String email = "test@example.com";
            String type = "register";
            when(valueOperations.setIfAbsent(anyString(), anyString(), anyLong(), any(TimeUnit.class)))
                .thenReturn(true)
                .thenReturn(false);

            // When
            assertDoesNotThrow(() -> authAppService.sendVerifyCode(email, type));
            assertDoesNotThrow(() -> authAppService.sendVerifyCode(email, type));

            // Then
            verify(mailService, timeout(500).times(1)).sendVerifyCodeMail(eq(email), anyString(), anyString());
        }
    }

    @Nested
    @DisplayName("个人用户注册测试")
    class PersonRegisterTests {

        @Test
        @DisplayName("个人用户注册失败 - 验证码错误")
        void registerPerson_WrongVerifyCode() {
            // Given
            setupRedisMock();
            PersonRegisterCmd cmd = new PersonRegisterCmd();
            cmd.setUsername("test@example.com");
            cmd.setPassword("password123");
            cmd.setVerifyCode("wrongcode");

            when(valueOperations.get("email_code:test@example.com:register")).thenReturn("123456");

            // When & Then
            assertThrows(Exceptions.BusinessException.class, () -> authAppService.registerPerson(cmd));
        }

        @Test
        @DisplayName("个人用户注册失败 - 验证码已过期")
        void registerPerson_VerifyCodeExpired() {
            // Given
            setupRedisMock();
            PersonRegisterCmd cmd = new PersonRegisterCmd();
            cmd.setUsername("test@example.com");
            cmd.setPassword("password123");
            cmd.setVerifyCode("123456");

            when(valueOperations.get("email_code:test@example.com:register")).thenReturn(null);

            // When & Then
            assertThrows(Exceptions.BusinessException.class, () -> authAppService.registerPerson(cmd));
        }

        @Test
        @DisplayName("个人用户注册失败 - 用户已存在")
        void registerPerson_UserAlreadyExists() {
            // Given
            setupRedisMock();
            PersonRegisterCmd cmd = new PersonRegisterCmd();
            cmd.setUsername("test@example.com");
            cmd.setPassword("password123");
            cmd.setVerifyCode("123456");

            when(valueOperations.get("email_code:test@example.com:register")).thenReturn("123456");

            User existingUser = new User();
            when(userRepository.findByUsername("test@example.com")).thenReturn(Optional.of(existingUser));

            // When & Then
            assertThrows(Exceptions.BusinessException.class, () -> authAppService.registerPerson(cmd));
        }
    }

    @Nested
    @DisplayName("忘记密码测试")
    class ForgotPasswordTests {

        @Test
        @DisplayName("忘记密码成功")
        void forgotPassword_Success() {
            // Given
            setupRedisMock();
            String email = "test@example.com";
            String verifyCode = "123456";
            String newPassword = "newPassword123";

            when(valueOperations.get("email_code:" + email + ":forgot_password")).thenReturn(verifyCode);

            User user = new User();
            user.setId(1L);
            user.setUsername(Username.of(email));
            user.setPassword(EncryptedPassword.encode("oldPassword"));
            when(userRepository.findByUsername(email)).thenReturn(Optional.of(user));

            // When
            authAppService.forgotPassword(email, verifyCode, newPassword);

            // Then
            verify(redisTemplate).delete("email_code:" + email + ":forgot_password");
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("忘记密码失败 - 验证码错误")
        void forgotPassword_WrongVerifyCode() {
            // Given
            setupRedisMock();
            String email = "test@example.com";
            String wrongCode = "wrongcode";

            when(valueOperations.get("email_code:" + email + ":forgot_password")).thenReturn("123456");

            // When & Then
            assertThrows(Exceptions.BusinessException.class,
                () -> authAppService.forgotPassword(email, wrongCode, "newPassword"));
        }

        @Test
        @DisplayName("忘记密码失败 - 用户不存在")
        void forgotPassword_UserNotFound() {
            // Given
            setupRedisMock();
            String email = "nonexistent@example.com";
            String verifyCode = "123456";

            when(valueOperations.get("email_code:" + email + ":forgot_password")).thenReturn(verifyCode);
            when(userRepository.findByUsername(email)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(Exceptions.BusinessException.class,
                () -> authAppService.forgotPassword(email, verifyCode, "newPassword"));
        }
    }

    @Nested
    @DisplayName("用户登录测试")
    class LoginTests {

        @Test
        @DisplayName("用户登录失败 - 用户不存在")
        void login_UserNotFound() {
            // Given
            setupRedisMock();
            String username = "nonexistent@example.com";
            String password = "password123";

            when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

            // When & Then
            assertThrows(Exceptions.BusinessException.class,
                () -> authAppService.login(username, password));
        }

        @Test
        @DisplayName("用户登录失败 - 账号已锁定")
        void login_AccountLocked() {
            // Given
            setupRedisMock();
            String username = "test@example.com";
            String password = "password123";

            User user = new User();
            user.setId(1L);
            user.setUsername(Username.of(username));
            user.setPassword(EncryptedPassword.encode(password));
            user.setUserType(UserType.PERSON);
            // 设置锁定状态
            user.setFailedLoginCount(5);
            user.setLockedUntil(java.time.LocalDateTime.now().plusMinutes(15));

            when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

            // When & Then
            assertThrows(Exceptions.BusinessException.class,
                () -> authAppService.login(username, password));
        }

        @Test
        @DisplayName("用户登录失败 - 密码错误")
        void login_WrongPassword() {
            // Given
            setupRedisMock();
            String username = "test@example.com";
            String wrongPassword = "wrongpassword";

            User user = new User();
            user.setId(1L);
            user.setUsername(Username.of(username));
            user.setPassword(EncryptedPassword.encode("correctpassword"));
            user.setUserType(UserType.PERSON);
            user.setFailedLoginCount(0);

            when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);

            // When & Then
            assertThrows(Exceptions.BusinessException.class,
                () -> authAppService.login(username, wrongPassword));
        }

        @Test
        @DisplayName("企业用户登录失败 - 待加入审批")
        void login_CompanyPendingJoin_ShouldThrow() {
            // Given
            setupRedisMock();
            String username = "hr@example.com";
            String password = "password123";

            User user = new User();
            user.setId(10L);
            user.setUsername(Username.of(username));
            user.setPassword(EncryptedPassword.encode(password));
            user.setUserType(UserType.COMPANY);
            user.setStatus(AuthStatus.VERIFIED);

            CompanyStaff staff = new CompanyStaff();
            staff.setUserId(10L);
            staff.setCompanyId(100L);
            staff.setStatus(CompanyStaff.STATUS_PENDING_JOIN);

            when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(companyStaffRepository.findByUserId(10L)).thenReturn(Optional.of(staff));

            // When & Then
            Exceptions.BusinessException ex = assertThrows(Exceptions.BusinessException.class,
                () -> authAppService.login(username, password));
            assertEquals("账号审核中，暂未开通，请等待企业负责人确认", ex.getMessage());
        }
    }

    @Nested
    @DisplayName("企业用户注册测试")
    class CompanyRegisterTests {

        @Test
        @DisplayName("已存在企业注册后创建待加入记录且不自动登录")
        void registerCompany_ExistingCompany_ShouldPendingAndNoLogin() {
            // Given
            setupRedisMock();
            CompanyRegisterCmd cmd = new CompanyRegisterCmd();
            cmd.setUsername("newhr@example.com");
            cmd.setPassword("password123");
            cmd.setVerifyCode("123456");
            cmd.setCompanyName("Existing Co");
            cmd.setUnifiedSocialCreditCode("91110000000000001X");

            when(valueOperations.get("email_code:newhr@example.com:register")).thenReturn("123456");
            when(userRepository.findByUsername("newhr@example.com")).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User saved = invocation.getArgument(0);
                saved.setId(200L);
                return saved;
            });
            Company existing = new Company();
            existing.setId(300L);
            existing.setName("Existing Co");
            when(companyRepository.findByName("Existing Co")).thenReturn(Optional.of(existing));
            when(companyStaffRepository.save(any(CompanyStaff.class))).thenAnswer(invocation -> invocation.getArgument(0));

            try (MockedStatic<StpUtil> stpUtilMock = mockStatic(StpUtil.class)) {
                // When & Then
                Exceptions.BusinessException ex = assertThrows(Exceptions.BusinessException.class,
                    () -> authAppService.registerCompany(cmd));
                assertEquals("已提交申请，等待企业负责人确认", ex.getMessage());
                stpUtilMock.verifyNoInteractions();
            }

            verify(companyStaffRepository).save(argThat(staff ->
                CompanyStaff.STATUS_PENDING_JOIN.equals(staff.getStatus())
                    && CompanyStaff.POST_HR.equals(staff.getPost())
                    && Long.valueOf(200L).equals(staff.getUserId())
                    && Long.valueOf(300L).equals(staff.getCompanyId())
            ));
        }
    }
}
