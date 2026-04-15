package com.graphhire.domain.model;

import com.graphhire.domain.vo.UserType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements Serializable {
    private Long id;
    private String username;
    private String password;
    private String email;
    private UserType userType;
    private Integer status;
    private LocalDateTime lastLoginTime;
    private String lastLoginIp;
    private Integer failedAttempts;
    private LocalDateTime lockUntil;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
