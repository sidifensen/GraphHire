package com.graphhire.auth.application.command;

public class SendVerifyCodeCmd {
    private String email;

    public SendVerifyCodeCmd(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}