package com.graphhire.web.controller;

import com.graphhire.web.dto.request.LoginRequest;
import com.graphhire.web.dto.request.PersonRegisterRequest;
import com.graphhire.web.dto.request.CompanyRegisterRequest;
import com.graphhire.web.dto.response.ApiResponse;
import com.graphhire.application.dto.LoginResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private Object authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        // TODO: Implement login logic
        return ApiResponse.success();
    }

    @PostMapping("/person/register")
    public ApiResponse<LoginResponse> personRegister(@RequestBody PersonRegisterRequest request) {
        // TODO: Implement person registration logic
        return ApiResponse.success();
    }

    @PostMapping("/company/register")
    public ApiResponse<LoginResponse> companyRegister(@RequestBody CompanyRegisterRequest request) {
        // TODO: Implement company registration logic
        return ApiResponse.success();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        // TODO: Implement logout logic
        return ApiResponse.success();
    }

    @PostMapping("/send-verify-code")
    public ApiResponse<Void> sendVerifyCode(@RequestParam String email) {
        // TODO: Implement send verification code logic
        return ApiResponse.success();
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestParam String email, @RequestParam String code, @RequestParam String newPassword) {
        // TODO: Implement reset password logic
        return ApiResponse.success();
    }
}
