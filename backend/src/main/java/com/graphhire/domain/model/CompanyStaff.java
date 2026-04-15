package com.graphhire.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyStaff implements Serializable {
    private Long id;
    private Long companyId;
    private Long userId;
    private String post;
    private LocalDateTime createdAt;
}
