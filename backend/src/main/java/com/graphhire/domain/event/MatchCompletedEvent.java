package com.graphhire.domain.event;

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
public class MatchCompletedEvent implements Serializable {
    private Long matchRecordId;
    private Long resumeId;
    private Long jobId;
    private BigDecimal overallScore;
}
