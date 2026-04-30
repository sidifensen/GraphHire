package com.graphhire.auth.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.auth.application.command.ForgotPasswordCmd;
import com.graphhire.auth.application.command.ResetPasswordCmd;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.interfaces.dto.request.CompanyRegisterRequest;
import com.graphhire.auth.interfaces.dto.request.LoginRequest;
import com.graphhire.auth.interfaces.dto.request.PersonRegisterRequest;
import com.graphhire.auth.interfaces.dto.request.RefreshTokenRequest;
import com.graphhire.auth.interfaces.dto.response.AuthContextResponse;
import com.graphhire.auth.interfaces.dto.response.LoginResponse;
import com.graphhire.common.vo.Exceptions;
import com.graphhire.common.vo.Result;
import jakarta.validation.Valid;
import org.springframework.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 * 提供用户登录、注册、登出等认证相关的 HTTP 接口
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthAppService authService;

    @Autowired
    private UserRepository userRepository;

    /**
     * 用户登录
     * @param request 登录请求（email、password）
     * @return 登录响应（token、userType）
     */
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(authService.login(request.getUsername(), request.getPassword()));
    }

    /**
     * 个人用户注册
     * @param request 注册请求（username、password）
     * @return 登录响应（token、userType）
     */
    @PostMapping("/register/person")
    public Result<LoginResponse> personRegister(@Valid @RequestBody PersonRegisterRequest request) {
        return Result.success(authService.registerPerson(request.toCmd()));
    }

    /**
     * 企业用户注册
     * @param request 企业注册请求（username、password、companyName、unifiedSocialCreditCode）
     * @return 登录响应（token、userType）
     */
    @PostMapping("/register/company")
    public Result<LoginResponse> companyRegister(@Valid @RequestBody CompanyRegisterRequest request) {
        return Result.success(authService.registerCompany(request.toCmd()));
    }

    /**
     * 管理员登录
     * @param request 登录请求（email、password）
     * @return 登录响应（token、userType）
     */
    @PostMapping("/admin/login")
    public Result<LoginResponse> adminLogin(@Valid @RequestBody LoginRequest request) {
        return Result.success(authService.adminLogin(request.getUsername(), request.getPassword()));
    }

    /**
     * 发送验证码
     * @param email 邮箱地址
     * @param type 验证码类型（register/forgot_password）
     * @return void
     */
    @PostMapping("/send-verify-code")
    public Result<Void> sendVerifyCode(@RequestParam String email,
                                       @RequestParam(defaultValue = "default") String type) {
        authService.sendVerifyCode(email, type);
        return Result.success();
    }

    /**
     * 忘记密码
     * @param cmd 忘记密码命令（username、verifyCode、newPassword）
     * @return void
     */
    @PostMapping("/forgot-password")
    public Result<Void> forgotPassword(@RequestBody ForgotPasswordCmd cmd) {
        authService.forgotPassword(cmd.getUsername(), cmd.getVerifyCode(), cmd.getNewPassword());
        return Result.success();
    }

    /**
     * 重置密码
     * @param cmd 重置密码命令（email、code、newPassword）
     * @return void
     */
    @PostMapping("/reset-password")
    public Result<Void> resetPassword(@RequestBody ResetPasswordCmd cmd) {
        authService.resetPassword(cmd.getEmail(), cmd.getCode(), cmd.getNewPassword());
        return Result.success();
    }

    /**
     * 登出
     * Sa-Token 自动获取当前用户并销毁 Token
     * @return void
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        StpUtil.logout();
        return Result.success();
    }

    /**
     * 获取当前登录用户ID
     * @return 用户ID
     */
    @GetMapping("/current")
    public Result<Long> getCurrentUser() {
        return Result.success(StpUtil.getLoginIdAsLong());
    }

    /**
     * 刷新 Token
     * 使用 refresh-token 机制自动续期
     * @param refreshToken 刷新令牌
     * @return 新的登录响应（token、userType）
     */
    @PostMapping("/refresh-token")
    public Result<LoginResponse> refreshToken(@RequestBody(required = false) RefreshTokenRequest request,
                                              @RequestParam(required = false) String refreshToken) {
        String token = request != null ? request.getRefreshToken() : refreshToken;
        if (!StringUtils.hasText(token)) {
            throw Exceptions.BusinessException.of("refreshToken不能为空");
        }
        return Result.success(authService.refreshToken(token));
    }

    /**
     * 校验当前 Token 是否有效
     * @return true 表示有效，false 表示无效
     */
    @GetMapping("/validate")
    public Result<Boolean> validateToken() {
        return Result.success(StpUtil.isLogin());
    }

    /**
     * 获取当前登录上下文（后端真实用户类型）
     * @return 当前登录用户ID与角色类型
     */
    @GetMapping("/context")
    public Result<AuthContextResponse> getContext() {
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exceptions.UnauthorizedException("登录用户不存在"));
        return Result.success(new AuthContextResponse(userId, user.getUserType().name()));
    }
}
