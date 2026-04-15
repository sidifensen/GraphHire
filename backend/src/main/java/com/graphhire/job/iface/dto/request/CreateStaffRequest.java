package com.graphhire.job.iface.dto.request;

public class CreateStaffRequest {
    private String username;
    private String password;
    private String post;  // HR or RECRUITER

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

    public String getPost() {
        return post;
    }

    public void setPost(String post) {
        this.post = post;
    }
}
