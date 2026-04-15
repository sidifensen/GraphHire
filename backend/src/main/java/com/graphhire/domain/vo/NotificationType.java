package com.graphhire.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationType {
    RESUME_PARSED(1, "简历解析完成"),
    JOB_RECOMMENDED(2, "新职位推荐"),
    CANDIDATE_RECOMMENDED(3, "收到候选人推荐"),
    COMPANY_AUTH_RESULT(4, "企业认证结果"),
    RESUME_VIEWED(5, "简历被查看");

    private final Integer code;
    private final String desc;
}
