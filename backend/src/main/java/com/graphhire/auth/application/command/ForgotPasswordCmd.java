package com.graphhire.auth.application.command;

/**
 * 忘记密码命令
 * 用于接收用户忘记密码时的请求参数（用户名、验证码、新密码）
 */
public class ForgotPasswordCmd {
    private String username;
    private String verifyCode;
    private String newPassword;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getVerifyCode() {
        return verifyCode;
    }

    public void setVerifyCode(String verifyCode) {
        this.verifyCode = verifyCode;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}