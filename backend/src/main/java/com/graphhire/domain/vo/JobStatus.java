package com.graphhire.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum JobStatus {
    DRAFT(0, "草稿"),
    PENDING_REVIEW(1, "待审核"),
    PUBLISHED(2, "已上架"),
    OFFLINE(3, "已下架");

    private final Integer code;
    private final String desc;
}
