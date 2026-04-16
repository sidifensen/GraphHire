package com.graphhire.auth.interfaces.dto.request;

public class PersonRegisterRequest {
    private String username;
    private String password;

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

    public com.graphhire.auth.application.command.PersonRegisterCmd toCmd() {
        com.graphhire.auth.application.command.PersonRegisterCmd cmd = new com.graphhire.auth.application.command.PersonRegisterCmd();
        cmd.setUsername(this.username);
        cmd.setPassword(this.password);
        return cmd;
    }
}
