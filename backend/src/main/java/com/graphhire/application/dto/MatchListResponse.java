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
public class MatchListResponse {
    private Long matchRecordId;
    private Long resumeId;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private BigDecimal overallScore;
    private String matchReason;
    private LocalDateTime createdAt;
}
