package com.graphhire.auth.application.command;

public class SendVerifyCodeCmd {
    private String username;

    public SendVerifyCodeCmd(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
