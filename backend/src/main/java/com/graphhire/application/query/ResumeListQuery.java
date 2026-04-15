package com.graphhire.application.query;

import lombok.Data;

@Data
public class ResumeListQuery {
    private Long userId;
    private Integer page = 1;
    private Integer pageSize = 10;
}
