package com.graphhire.match.application.command;

/**
 * 触发匹配命令
 * 用于触发人岗匹配计算，包含要匹配的简历和职位信息
 */
public class TriggerMatchCmd {
    /** 简历ID */
    private Long resumeId;
    /** 职位ID */
    private Long jobId;

    public TriggerMatchCmd() {
    }

    public TriggerMatchCmd(Long resumeId, Long jobId) {
        this.resumeId = resumeId;
        this.jobId = jobId;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public Long getJobId() {
        return jobId;
    }
}
