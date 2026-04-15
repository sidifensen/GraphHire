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
import org.springframework.stereotype.Service;

@Service
public class AuthAppService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        String token = generateToken(user);
        return new LoginResponse(token, user.getUserType());
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
        String token = generateToken(user);
        return new LoginResponse(token, user.getUserType());
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
        String token = generateToken(user);
        return new LoginResponse(token, user.getUserType());
    }

    public void sendVerifyCode(SendVerifyCodeCmd cmd) {
        // Implementation for sending verification code
    }

    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> Exceptions.BusinessException.of("用户不存在"));
        user.setPassword(com.graphhire.auth.domain.vo.EncryptedPassword.encode(newPassword));
        userRepository.save(user);
    }

    public boolean validateToken(TokenValidateQuery query) {
        // Implementation for token validation using sa-token
        return true;
    }

    private String generateToken(User user) {
        // Implementation for token generation using sa-token
        return "token-" + user.getId();
    }
}