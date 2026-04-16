package com.graphhire.auth.application.query;

/**
 * Token 校验查询
 * 封装 Token 校验所需的参数
 */
public class TokenValidateQuery {
    /** 待校验的 Sa-Token */
    private String token;

    public TokenValidateQuery(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}