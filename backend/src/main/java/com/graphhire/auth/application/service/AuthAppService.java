package com.graphhire.auth.application.service;

import com.graphhire.auth.application.command.CompanyRegisterCmd;
import com.graphhire.auth.application.command.PersonRegisterCmd;
import com.graphhire.auth.application.command.SendVerifyCodeCmd;
import com.graphhire.auth.application.query.TokenValidateQuery;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.service.PasswordEncoder;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.auth.iface.dto.response.LoginResponse;
import com.graphhire.common.vo.Exceptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class AuthAppService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final long ACCESS_TOKEN_EXPIRE_SECONDS = 7200; // 2 hours
    private static final long REFRESH_TOKEN_EXPIRE_DAYS = 7;

    public LoginResponse login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> Exceptions.BusinessException.of("用户不存在"));
        if (user.isLocked()) {
            throw Exceptions.BusinessException.of("账号已锁定");
        }
        if (!user.getPassword().matches(password)) {
            user.loginFailed();
            userRepository.save(user);
            throw Exceptions.BusinessException.of("密码错误");
        }
        user.loginSuccess();
        userRepository.save(user);
        return generateTokenPair(user);
    }

    public LoginResponse registerPerson(PersonRegisterCmd cmd) {
        if (userRepository.findByUsername(cmd.getUsername()).isPresent()) {
            throw Exceptions.BusinessException.of("用户已存在");
        }
        User user = new User();
        user.setUsername(com.graphhire.auth.domain.vo.Username.of(cmd.getUsername()));
        user.setUserType(UserType.PERSON);
        user.register(cmd.getPassword());
        userRepository.save(user);
        return generateTokenPair(user);
    }

    public LoginResponse registerCompany(CompanyRegisterCmd cmd) {
        if (userRepository.findByUsername(cmd.getUsername()).isPresent()) {
            throw Exceptions.BusinessException.of("用户已存在");
        }
        User user = new User();
        user.setUsername(com.graphhire.auth.domain.vo.Username.of(cmd.getUsername()));
        user.setUserType(UserType.COMPANY);
        user.register(cmd.getPassword());
        userRepository.save(user);
        return generateTokenPair(user);
    }

    public void sendVerifyCode(SendVerifyCodeCmd cmd) {
        sendVerifyCode(cmd.getEmail(), "default");
    }

    public void sendVerifyCode(String email, String type) {
        // Generate 6-digit code
        String code = String.format("%06d", new Random().nextInt(999999));
        // Store in Redis: email_code:{email}:{type} with 15 min TTL
        String key = "email_code:" + email + ":" + type;
        redisTemplate.opsForValue().set(key, code, 15, TimeUnit.MINUTES);
        // TODO: Send email via email service (log for now if not implemented)
        System.out.println("Sending verification code " + code + " to " + email);
    }

    public void forgotPassword(String email) {
        // Find user by email (username)
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> Exceptions.BusinessException.of("用户不存在"));
        // Send verification code
        sendVerifyCode(email, "forgot_password");
    }

    public void resetPassword(String email, String code, String newPassword) {
        // Verify the code first
        String key = "email_code:" + email + ":forgot_password";
        String storedCode = redisTemplate.opsForValue().get(key);
        if (storedCode == null || !storedCode.equals(code)) {
            throw Exceptions.BusinessException.of("验证码错误或已过期");
        }
        // Delete the used code
        redisTemplate.delete(key);
        // Update password
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> Exceptions.BusinessException.of("用户不存在"));
        user.setPassword(com.graphhire.auth.domain.vo.EncryptedPassword.encode(newPassword));
        userRepository.save(user);
    }

    public boolean validateToken(TokenValidateQuery query) {
        return validateToken(query.getToken());
    }

    public boolean validateToken(String token) {
        // Check if access token exists in Redis
        return redisTemplate.hasKey("satoken:login:" + token);
    }

    public void logout(Long userId) {
        // Delete both tokens from Redis
        redisTemplate.delete("satoken:login:" + userId);
        redisTemplate.delete("satoken:refresh:" + userId);
    }

    public LoginResponse refreshToken(String refreshToken) {
        // Find userId by refresh token
        String userIdKey = findUserIdByRefreshToken(refreshToken);
        if (userIdKey == null) {
            throw Exceptions.BusinessException.of("Refresh token expired or invalid");
        }
        Long userId = Long.parseLong(userIdKey);
        // Delete old tokens
        logout(userId);
        // Get user and generate new token pair
        User user = userRepository.findById(userId)
                .orElseThrow(() -> Exceptions.BusinessException.of("用户不存在"));
        return generateTokenPair(user);
    }

    /**
     * Admin login - verifies user_type is ADMIN
     */
    public LoginResponse adminLogin(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> Exceptions.BusinessException.of("用户不存在"));
        if (user.isLocked()) {
            throw Exceptions.BusinessException.of("账号已锁定");
        }
        if (user.getUserType() != UserType.ADMIN) {
            throw Exceptions.BusinessException.of("非管理员账号");
        }
        if (!user.getPassword().matches(password)) {
            user.loginFailed();
            userRepository.save(user);
            throw Exceptions.BusinessException.of("密码错误");
        }
        user.loginSuccess();
        userRepository.save(user);
        return generateTokenPair(user);
    }

    private LoginResponse generateTokenPair(User user) {
        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);
        return new LoginResponse(accessToken, refreshToken, ACCESS_TOKEN_EXPIRE_SECONDS, user.getUserType(), user.getId());
    }

    private String generateAccessToken(User user) {
        String token = "access_" + user.getId() + "_" + System.currentTimeMillis();
        redisTemplate.opsForValue().set("satoken:login:" + user.getId(), token, ACCESS_TOKEN_EXPIRE_SECONDS, TimeUnit.SECONDS);
        return token;
    }

    private String generateRefreshToken(User user) {
        String token = "refresh_" + user.getId() + "_" + System.currentTimeMillis();
        redisTemplate.opsForValue().set("satoken:refresh:" + user.getId(), token, REFRESH_TOKEN_EXPIRE_DAYS, TimeUnit.DAYS);
        return token;
    }

    private String findUserIdByRefreshToken(String refreshToken) {
        // Scan Redis to find the userId that owns this refresh token
        // This is a simplified implementation - in production, you might want to store reverse mapping
        String pattern = "satoken:refresh:*";
        var keys = redisTemplate.keys(pattern);
        if (keys != null) {
            for (String key : keys) {
                String token = redisTemplate.opsForValue().get(key);
                if (refreshToken.equals(token)) {
                    // Extract userId from key: satoken:refresh:{userId}
                    return key.replace("satoken:refresh:", "");
                }
            }
        }
        return null;
    }
}
