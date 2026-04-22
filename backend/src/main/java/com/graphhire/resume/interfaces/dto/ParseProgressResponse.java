package com.graphhire.resume.interfaces.dto;

import java.time.LocalDateTime;

/**
 * 简历解析进度响应
 */
public class ParseProgressResponse {
    /** 简历ID */
    private Long resumeId;
    /** 解析状态：PENDING/RUNNING/SUCCESS/FAILED */
    private String status;
    /** 进度百分比（0-100） */
    private Integer progress;
    /** 当前步骤描述 */
    private String step;
    /** 错误信息（解析失败时） */
    private String errorMessage;
    /** 开始时间 */
    private LocalDateTime startedAt;
    /** 完成时间 */
    private LocalDateTime completedAt;

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getStep() {
        return step;
    }

    public void setStep(String step) {
        this.step = step;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}