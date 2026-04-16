package com.graphhire.auth.iface.controller;

import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.iface.dto.request.CompanyRegisterRequest;
import com.graphhire.auth.iface.dto.request.LoginRequest;
import com.graphhire.auth.iface.dto.request.PersonRegisterRequest;
import com.graphhire.auth.iface.dto.response.LoginResponse;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthAppService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest request) {
        return Result.success(authService.login(request.getUsername(), request.getPassword()));
    }

    @PostMapping("/register/person")
    public Result<LoginResponse> personRegister(@RequestBody PersonRegisterRequest request) {
        return Result.success(authService.registerPerson(request.toCmd()));
    }

    @PostMapping("/register/company")
    public Result<LoginResponse> companyRegister(@RequestBody CompanyRegisterRequest request) {
        return Result.success(authService.registerCompany(request.toCmd()));
    }

    @PostMapping("/send-verify-code")
    public Result<Void> sendVerifyCode(@RequestParam String email) {
        authService.sendVerifyCode(email, "default");
        return Result.success();
    }

    @PostMapping("/forgot-password")
    public Result<Void> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return Result.success();
    }

    @PostMapping("/reset-password")
    public Result<Void> resetPassword(@RequestParam String email,
                                      @RequestParam String code,
                                      @RequestParam String newPassword) {
        authService.resetPassword(email, code, newPassword);
        return Result.success();
    }

    @PostMapping("/logout")
    public Result<Void> logout(@RequestParam Long userId) {
        authService.logout(userId);
        return Result.success();
    }

    @PostMapping("/refresh-token")
    public Result<LoginResponse> refreshToken(@RequestParam String refreshToken) {
        return Result.success(authService.refreshToken(refreshToken));
    }
}
