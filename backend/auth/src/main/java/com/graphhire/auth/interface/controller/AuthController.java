package com.graphhire.auth.interface.controller;

import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.interface.dto.request.CompanyRegisterRequest;
import com.graphhire.auth.interface.dto.request.LoginRequest;
import com.graphhire.auth.interface.dto.request.PersonRegisterRequest;
import com.graphhire.auth.interface.dto.response.LoginResponse;
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

    @PostMapping("/person/register")
    public Result<LoginResponse> personRegister(@RequestBody PersonRegisterRequest request) {
        return Result.success(authService.registerPerson(request.toCmd()));
    }

    @PostMapping("/company/register")
    public Result<LoginResponse> companyRegister(@RequestBody CompanyRegisterRequest request) {
        return Result.success(authService.registerCompany(request.toCmd()));
    }

    @PostMapping("/send-verify-code")
    public Result<Void> sendVerifyCode(@RequestParam String email) {
        authService.sendVerifyCode(new com.graphhire.auth.application.command.SendVerifyCodeCmd(email));
        return Result.success();
    }

    @PostMapping("/reset-password")
    public Result<Void> resetPassword(@RequestParam String email,
                                      @RequestParam String code,
                                      @RequestParam String newPassword) {
        authService.resetPassword(email, code, newPassword);
        return Result.success();
    }
}