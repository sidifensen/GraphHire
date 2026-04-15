package com.graphhire.application.dto;

import com.graphhire.domain.vo.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String token;
    private UserType userType;
    private Long userId;
    private String username;
}
