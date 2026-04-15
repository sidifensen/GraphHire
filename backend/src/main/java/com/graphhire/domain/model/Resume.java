package com.graphhire.domain.model;

import com.graphhire.domain.vo.ParseStatus;
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
public class Resume implements Serializable {
    private Long id;
    private Long userId;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private ParseStatus parseStatus;
    private String parseResult;
    private String parseError;
    private BigDecimal confidence;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
