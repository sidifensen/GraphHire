package com.graphhire.application.service;

import com.graphhire.application.command.CompanyRegisterCmd;
import com.graphhire.application.command.LoginCmd;
import com.graphhire.application.command.PersonRegisterCmd;
import com.graphhire.application.dto.LoginResponse;
import com.graphhire.domain.model.Company;
import com.graphhire.domain.model.CompanyStaff;
import com.graphhire.domain.model.Person;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.CompanyStaffRepository;
import com.graphhire.domain.repository.PersonRepository;
import com.graphhire.domain.repository.UserRepository;
import com.graphhire.domain.vo.UserType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthAppService {
    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final CompanyRepository companyRepository;
    private final CompanyStaffRepository companyStaffRepository;

    // Simple in-memory code storage for verification codes (in production, use Redis)
    private static final Map<String, String> VERIFY_CODES = new ConcurrentHashMap<>();

    @Transactional
    public void registerPerson(PersonRegisterCmd cmd) {
        log.info("Registering person user: {}", cmd.getUsername());

        // Check if username already exists
        if (userRepository.existsByUsername(cmd.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(cmd.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }

        // Create user
        User user = User.builder()
                .username(cmd.getUsername())
                .password(cmd.getPassword()) // In production, encode the password
                .email(cmd.getEmail())
                .userType(UserType.PERSON)
                .status(1)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(user);

        // Create person profile
        Person person = Person.builder()
                .userId(user.getId())
                .createdAt(LocalDateTime.now())
                .build();
        personRepository.save(person);

        log.info("Person user registered successfully: userId={}", user.getId());
    }

    @Transactional
    public void registerCompany(CompanyRegisterCmd cmd) {
        log.info("Registering company: {}", cmd.getCompanyName());

        // Check if username already exists
        if (userRepository.existsByUsername(cmd.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(cmd.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }

        // Create company user
        User user = User.builder()
                .username(cmd.getUsername())
                .password(cmd.getPassword()) // In production, encode the password
                .email(cmd.getEmail())
                .userType(UserType.COMPANY)
                .status(1)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(user);

        // Create company profile
        Company company = Company.builder()
                .userId(user.getId())
                .companyName(cmd.getCompanyName())
                .unifiedSocialCreditCode(cmd.getUnifiedSocialCreditCode())
                .licensePath(cmd.getLicensePath())
                .authStatus(com.graphhire.domain.vo.AuthStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        companyRepository.save(company);

        log.info("Company registered successfully: userId={}, companyId={}", user.getId(), company.getId());
    }

    public LoginResponse login(LoginCmd cmd) {
        log.info("User login attempt: {}", cmd.getUsername());

        User user = userRepository.findByUsername(cmd.getUsername());
        if (user == null) {
            throw new RuntimeException("用户名或密码错误");
        }

        // Check password (in production, use password encoding)
        if (!cmd.getPassword().equals(user.getPassword())) {
            log.warn("Login failed: wrong password for user: {}", cmd.getUsername());
            throw new RuntimeException("用户名或密码错误");
        }

        // Check user status
        if (user.getStatus() != 1) {
            log.warn("Login failed: user disabled, userId={}", user.getId());
            throw new RuntimeException("用户已被禁用");
        }

        // Generate token (in production, use JWT or similar)
        String token = "token_" + user.getId() + "_" + System.currentTimeMillis();

        // Update last login info
        user.setLastLoginTime(LocalDateTime.now());
        user.setLastLoginIp(cmd.getUsername()); // In production, get from request
        userRepository.save(user);

        log.info("User logged in successfully: userId={}", user.getId());

        return LoginResponse.builder()
                .token(token)
                .userType(user.getUserType())
                .userId(user.getId())
                .username(user.getUsername())
                .build();
    }

    public void sendVerifyCode(String email) {
        log.info("Sending verify code to email: {}", email);

        // Generate 6-digit code
        String code = String.format("%06d", (int) (Math.random() * 1000000));
        VERIFY_CODES.put(email, code);

        // In production, send email via email service
        log.info("Verify code for {} is: {}", email, code);
    }

    public boolean verifyCode(String email, String code) {
        log.info("Verifying code for email: {}", email);
        String storedCode = VERIFY_CODES.get(email);
        if (storedCode != null && storedCode.equals(code)) {
            VERIFY_CODES.remove(email);
            return true;
        }
        return false;
    }

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        log.info("Changing password for userId: {}", userId);

        User user = userRepository.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // Verify old password (in production, use password encoding)
        if (!oldPassword.equals(user.getPassword())) {
            throw new RuntimeException("原密码错误");
        }

        user.setPassword(newPassword); // In production, encode the new password
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Password changed successfully for userId: {}", userId);
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        log.info("Resetting password for email: {}", email);

        if (!verifyCode(email, code)) {
            throw new RuntimeException("验证码错误");
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("该邮箱未注册");
        }

        user.setPassword(newPassword); // In production, encode the new password
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Password reset successfully for email: {}", email);
    }

    public User getCurrentUser(Long userId) {
        User user = userRepository.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return user;
    }
}
