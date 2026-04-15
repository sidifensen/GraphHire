package com.graphhire.application.query;

import lombok.Data;

@Data
public class JobListQuery {
    private Long companyId;
    private Integer page = 1;
    private Integer pageSize = 10;
}
