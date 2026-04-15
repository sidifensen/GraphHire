package com.graphhire.web.dto.response;

import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private Integer userType;
    private Long userId;
    private String username;
}
