package com.graphhire.resume.domain.model;

import com.graphhire.common.model.BaseEntity;

import java.time.LocalDateTime;

/**
 * 解析任务领域模型
 *
 * 【模块说明】管理简历解析任务的完整生命周期，支持状态流转和重试机制。
 *
 * 【状态机】
 * - PENDING：待执行
 * - RUNNING：执行中
 * - SUCCESS：执行成功
 * - FAILED：执行失败
 *
 * 【重试机制】
 * - 每次失败时 retryCount +1
 * - 可根据 retryCount 判断是否继续重试
 */
public class ParseTask extends BaseEntity {
    /** 任务ID */
    private Long id;
    /** 关联的简历ID */
    private Long resumeId;
    /** 关联的职位ID（可选） */
    private Long jobId;
    /** 任务类型 */
    private String taskType;
    /** 任务状态 */
    private TaskStatus status;
    /** 重试次数 */
    private Integer retryCount;
    /** 错误信息 */
    private String errorMessage;
    /** 创建时间 */
    private LocalDateTime createdAt;
    /** 开始执行时间 */
    private LocalDateTime startedAt;
    /** 完成时间 */
    private LocalDateTime completedAt;

    /** 任务状态枚举 */
    public enum TaskStatus {
        /** 待执行 */
        PENDING,
        /** 执行中 */
        RUNNING,
        /** 执行成功 */
        SUCCESS,
        /** 执行失败 */
        FAILED
    }

    /** 标记为待执行状态 */
    public void schedule() {
        this.status = TaskStatus.PENDING;
    }

    /** 标记为执行中状态 */
    public void markRunning() {
        this.status = TaskStatus.RUNNING;
    }

    /** 标记为成功状态，记录完成时间 */
    public void markSuccess() {
        this.status = TaskStatus.SUCCESS;
        this.completedAt = LocalDateTime.now();
    }

    /**
     * 标记为失败状态
     * 记录错误信息，累加重试次数，记录完成时间
     */
    public void markFailed(String error) {
        this.errorMessage = error;
        this.status = TaskStatus.FAILED;
        this.retryCount = (this.retryCount == null ? 1 : this.retryCount + 1);
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
