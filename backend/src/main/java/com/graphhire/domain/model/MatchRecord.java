package com.graphhire.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRecord implements Serializable {
    private Long id;
    private Long resumeId;
    private Long jobId;
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
