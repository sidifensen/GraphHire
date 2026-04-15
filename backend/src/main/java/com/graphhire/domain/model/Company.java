package com.graphhire.domain.model;

import com.graphhire.domain.vo.AuthStatus;
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
public class Company implements Serializable {
    private Long id;
    private Long userId;
    private String companyName;
    private String unifiedSocialCreditCode;
    private String licensePath;
    private AuthStatus authStatus;
    private String authReason;
    private LocalDateTime authTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
