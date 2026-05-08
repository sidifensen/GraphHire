package com.graphhire.resume.domain.model;

import java.time.LocalDateTime;

/**
 * 上传任务聚合根。
 * 说明：用于承载“文件上传 -> 简历入库 -> 解析排队”的异步状态机。
 */
public class UploadTask {

    /**
     * 任务状态：
     * PENDING -> UPLOADING -> UPLOADED -> PARSE_PENDING -> SUCCESS/FAILED。
     */
    public enum TaskStatus {
        PENDING,
        UPLOADING,
        UPLOADED,
        PARSE_PENDING,
        SUCCESS,
        FAILED
    }

    private Long id;
    private Long userId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private TaskStatus status;
    private String errorMessage;
    private Long resumeId;
    private Boolean refreshAllMatches;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime finishedAt;

    /** 标记进入对象存储上传阶段。 */
    public void markUploading() {
        this.status = TaskStatus.UPLOADING;
    }

    /** 标记文件已上传完成。 */
    public void markUploaded() {
        this.status = TaskStatus.UPLOADED;
    }

    /** 标记已创建解析任务并等待消费。 */
    public void markParsePending() {
        this.status = TaskStatus.PARSE_PENDING;
    }

    /** 标记任务成功并关联最终简历ID。 */
    public void markSuccess(Long resumeId) {
        this.status = TaskStatus.SUCCESS;
        this.resumeId = resumeId;
        this.finishedAt = LocalDateTime.now();
    }

    /** 标记任务失败并记录失败原因。 */
    public void markFailed(String message) {
        this.status = TaskStatus.FAILED;
        this.errorMessage = message;
        this.finishedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public Boolean getRefreshAllMatches() {
        return refreshAllMatches;
    }

    public void setRefreshAllMatches(Boolean refreshAllMatches) {
        this.refreshAllMatches = refreshAllMatches;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }
}
