package com.graphhire.resume.domain.model;

import com.graphhire.common.model.BaseEntity;

import java.time.LocalDateTime;

public class ParseTask extends BaseEntity {
    private Long id;
    private Long resumeId;
    private Long jobId;
    private String taskType;
    private TaskStatus status;
    private Integer retryCount;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    public enum TaskStatus {
        PENDING,
        RUNNING,
        SUCCESS,
        FAILED
    }

    public void schedule() {
        this.status = TaskStatus.PENDING;
    }

    public void markRunning() {
        this.status = TaskStatus.RUNNING;
    }

    public void markSuccess() {
        this.status = TaskStatus.SUCCESS;
        this.completedAt = LocalDateTime.now();
    }

    public void markFailed(String error) {
        this.errorMessage = error;
        this.status = TaskStatus.FAILED;
        this.retryCount++;
        this.completedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getTaskType() {
        return taskType;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
