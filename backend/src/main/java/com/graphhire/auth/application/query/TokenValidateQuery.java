package com.graphhire.auth.application.query;

public class TokenValidateQuery {
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