package com.graphhire.auth.iface.dto.request;

public class PersonRegisterRequest {
    private String username;
    private String password;
    private String email;

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public com.graphhire.auth.application.command.PersonRegisterCmd toCmd() {
        com.graphhire.auth.application.command.PersonRegisterCmd cmd = new com.graphhire.auth.application.command.PersonRegisterCmd();
        cmd.setUsername(this.username);
        cmd.setPassword(this.password);
        cmd.setEmail(this.email);
        return cmd;
    }
}