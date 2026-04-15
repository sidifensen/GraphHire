package com.graphhire.domain.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeParsedEvent implements Serializable {
    private Long resumeId;
    private Long userId;
    private boolean success;
    private String errorMessage;
}
