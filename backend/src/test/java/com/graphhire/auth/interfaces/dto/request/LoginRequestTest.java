package com.graphhire.auth.interfaces.dto.request;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginRequestTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    @DisplayName("邮箱为空时校验失败")
    void shouldFailWhenEmailBlank() {
        LoginRequest request = new LoginRequest();
        request.setUsername("");
        request.setPassword("password123");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
    }

    @Test
    @DisplayName("邮箱格式非法时校验失败")
    void shouldFailWhenEmailInvalid() {
        LoginRequest request = new LoginRequest();
        request.setUsername("invalid-email");
        request.setPassword("password123");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
    }

    @Test
    @DisplayName("邮箱格式正确时校验通过")
    void shouldPassWhenEmailValid() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user@example.com");
        request.setPassword("password123");

        Set<ConstraintViolation<LoginRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }
}
