package com.graphhire.web.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MatchListResponse {
    private Long matchRecordId;
    private Long resumeId;
    private Long jobId;
    private String jobTitle;
    private String companyName;
    private BigDecimal overallScore;
    private String matchReason;
    private Integer status;
    private LocalDateTime createdAt;
}
