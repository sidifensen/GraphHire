package com.graphhire.auth.application.command;

/**
 * 重置密码命令
 * 用于接收用户重置密码时的请求参数（邮箱、验证码、新密码）
 */
public class ResetPasswordCmd {
    private String email;
    private String code;
    private String newPassword;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}