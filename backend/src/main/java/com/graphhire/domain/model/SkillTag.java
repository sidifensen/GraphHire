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
public class SkillTag implements Serializable {
    private Long id;
    private String tagName;
    private String category;
    private LocalDateTime createdAt;
}
