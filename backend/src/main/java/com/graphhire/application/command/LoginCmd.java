package com.graphhire.application.command;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;

@Data
public class LoginCmd {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    private String captcha;
    private String captchaKey;
}
