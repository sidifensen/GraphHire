package com.graphhire.auth.interfaces.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class PersonRegisterRequest {
    @Email(message = "邮箱格式不正确")
    @NotBlank(message = "用户名不能为空")
    private String username;
    @NotBlank(message = "密码不能为空")
    private String password;
    @NotBlank(message = "验证码不能为空")
    private String verifyCode;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getVerifyCode() {
        return verifyCode;
    }

    public void setVerifyCode(String verifyCode) {
        this.verifyCode = verifyCode;
    }

    public com.graphhire.auth.application.command.PersonRegisterCmd toCmd() {
        com.graphhire.auth.application.command.PersonRegisterCmd cmd = new com.graphhire.auth.application.command.PersonRegisterCmd();
        cmd.setUsername(this.username);
        cmd.setPassword(this.password);
        cmd.setVerifyCode(this.verifyCode);
        return cmd;
    }
}
