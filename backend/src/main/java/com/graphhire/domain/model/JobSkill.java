package com.graphhire.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSkill implements Serializable {
    private Long id;
    private Long jobId;
    private Long skillTagId;
    private Boolean isRequired;
    private BigDecimal weight;
}
