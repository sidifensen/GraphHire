package com.graphhire.auth.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.StrUtil;
import com.graphhire.auth.application.command.ChangePasswordCmd;
import com.graphhire.auth.application.command.SendResetCodeCmd;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.regex.Pattern;

/**
 * 密码控制器
 * 提供修改密码、忘记密码、发送重置码等密码相关的 HTTP 接口
 */
@RestController
@RequestMapping("/auth")
public class PasswordController {

    /** 密码复杂度正则：8+字符，至少1个大写、1个小写、1个数字 */
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$");

    @Autowired
    private AuthAppService authService;

    /**
     * 修改密码
     * 需要用户已登录，验证旧密码后更新为新密码
     * @param cmd 修改密码命令（旧密码、新密码）
     * @return void
     */
    @PostMapping("/change-password")
    public Result<Void> changePassword(@RequestBody ChangePasswordCmd cmd) {
        // 步骤1：获取当前登录用户ID
        Long userId = StpUtil.getLoginIdAsLong();

        // 步骤2：校验新密码格式
        validatePasswordFormat(cmd.getNewPassword());

        // 步骤3：调用服务层修改密码（包含旧密码校验）
        authService.updatePassword(userId, cmd.getOldPassword(), cmd.getNewPassword());

        return Result.success();
    }

    /**
     * 发送重置码
     * 向指定邮箱发送密码重置验证码
     * @param cmd 发送重置码命令（username）
     * @return void
     */
    @PostMapping("/send-reset-code")
    public Result<Void> sendResetCode(@RequestBody SendResetCodeCmd cmd) {
        authService.sendVerifyCode(cmd.getUsername(), "forgot_password");
        return Result.success();
    }

    /**
     * 校验密码格式
     * 要求：8+字符，至少1个大写、1个小写、1个数字
     * @param password 明文密码
     */
    private void validatePasswordFormat(String password) {
        if (StrUtil.isBlank(password)) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("密码不能为空");
        }
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw com.graphhire.common.vo.Exceptions.BusinessException.of("密码格式不正确：至少8个字符，包含1个大写字母、1个小写字母和1个数字");
        }
    }
}
