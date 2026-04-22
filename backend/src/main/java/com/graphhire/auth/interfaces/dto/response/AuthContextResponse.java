package com.graphhire.auth.interfaces.dto.response;

public class AuthContextResponse {

    private Long userId;
    private String userType;

    public AuthContextResponse() {
    }

    public AuthContextResponse(Long userId, String userType) {
        this.userId = userId;
        this.userType = userType;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }
}
