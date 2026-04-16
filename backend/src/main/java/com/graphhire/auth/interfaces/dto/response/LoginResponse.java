package com.graphhire.auth.interfaces.dto.response;

import com.graphhire.auth.domain.vo.UserType;

public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private Long expiresIn;
    private UserType userType;
    private Long userId;

    public LoginResponse() {
    }

    public LoginResponse(String accessToken, String refreshToken, Long expiresIn, UserType userType, Long userId) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.userType = userType;
        this.userId = userId;
    }

    // 兼容旧版构造器
    public LoginResponse(String token, UserType userType) {
        this.accessToken = token;
        this.refreshToken = null;
        this.expiresIn = 7200L;
        this.userType = userType;
        this.userId = null;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public UserType getUserType() {
        return userType;
    }

    public void setUserType(UserType userType) {
        this.userType = userType;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
