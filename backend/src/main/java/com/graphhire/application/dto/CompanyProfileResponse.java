package com.graphhire.application.dto;

import com.graphhire.domain.vo.AuthStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String companyName;
    private String unifiedSocialCreditCode;
    private AuthStatus authStatus;
    private LocalDateTime authTime;
}
