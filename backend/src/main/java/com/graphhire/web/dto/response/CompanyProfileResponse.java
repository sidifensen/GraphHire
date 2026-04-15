package com.graphhire.web.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CompanyProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String companyName;
    private String unifiedSocialCreditCode;
    private Integer authStatus;
    private String authReason;
    private LocalDateTime authTime;
}
