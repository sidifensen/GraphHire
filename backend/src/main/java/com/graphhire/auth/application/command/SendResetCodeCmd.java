package com.graphhire.auth.application.command;

/**
 * 发送重置码命令
 * 用于请求密码重置验证码时的请求参数（用户名/邮箱）
 */
public class SendResetCodeCmd {
    private String username;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
