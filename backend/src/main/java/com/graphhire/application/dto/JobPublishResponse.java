package com.graphhire.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobPublishResponse {
    private Long jobId;
    private Long parseTaskId;
    private String message;
}
