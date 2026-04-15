package com.graphhire.auth.iface.dto.response;

import com.graphhire.auth.domain.vo.UserType;

public class LoginResponse {
    private String token;
    private UserType userType;

    public LoginResponse(String token, UserType userType) {
        this.token = token;
        this.userType = userType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserType getUserType() {
        return userType;
    }

    public void setUserType(UserType userType) {
        this.userType = userType;
    }
}