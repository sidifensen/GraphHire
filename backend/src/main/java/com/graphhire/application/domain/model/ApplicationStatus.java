package com.graphhire.application.domain.model;

public enum ApplicationStatus {
    PENDING("待处理"),
    VIEWED("已查看"),
    INTERVIEW_INVITED("面试邀请"),
    REJECTED("已拒绝"),
    ACCEPTED("已接受"),
    WITHDRAWN("已撤回");

    private final String description;
    ApplicationStatus(String description) { this.description = description; }
    public String getDescription() { return description; }
}
