package com.graphhire.web.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MatchDetailResponse {
    private Long matchRecordId;
    private Long resumeId;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private BigDecimal overallScore;
    private BigDecimal skillScore;
    private BigDecimal experienceScore;
    private BigDecimal cityScore;
    private BigDecimal educationScore;
    private BigDecimal salaryScore;
    private String matchReport;
    private Integer status;
    private LocalDateTime createdAt;
}
