package com.graphhire.application.dto;

import com.graphhire.domain.vo.ParseStatus;
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
public class ResumeDetailResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private ParseStatus parseStatus;
    private String parseResult;
    private BigDecimal confidence;
    private Boolean isDefault;
    private LocalDateTime createdAt;
}
