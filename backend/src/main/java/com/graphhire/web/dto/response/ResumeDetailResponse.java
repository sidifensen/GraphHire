package com.graphhire.web.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ResumeDetailResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Integer parseStatus;
    private String parseResult;
    private BigDecimal confidence;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
