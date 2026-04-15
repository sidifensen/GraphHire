package com.graphhire.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MatchDetailResponse {
    private Long matchRecordId;
    private Long resumeId;
    private Long jobId;
    private BigDecimal overallScore;
    private BigDecimal skillScore;
    private BigDecimal experienceScore;
    private BigDecimal cityScore;
    private BigDecimal educationScore;
    private BigDecimal salaryScore;
    private String matchReport;
    private LocalDateTime createdAt;
}
