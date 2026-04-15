package com.graphhire.resume.domain.model;

import com.graphhire.common.model.BaseEntity;

public class ParseTask extends BaseEntity {
    private Long id;
    private Long resumeId;
    private TaskStatus status;
    private String errorMessage;
    private Integer retryCount = 0;
    private String rawText;
    private String parseResult;

    public enum TaskStatus {
        PENDING,
        PROCESSING,
        SUCCESS,
        FAILED
    }

    public void schedule() {
        this.status = TaskStatus.PENDING;
    }

    public void markProcessing() {
        this.status = TaskStatus.PROCESSING;
    }

    public void markSuccess(String result) {
        this.parseResult = result;
        this.status = TaskStatus.SUCCESS;
    }

    public void markFailed(String error) {
        this.errorMessage = error;
        this.status = TaskStatus.FAILED;
        this.retryCount++;
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

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    public String getParseResult() {
        return parseResult;
    }

    public void setParseResult(String parseResult) {
        this.parseResult = parseResult;
    }
}
