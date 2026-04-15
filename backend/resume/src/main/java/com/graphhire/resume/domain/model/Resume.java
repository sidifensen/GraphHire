package com.graphhire.resume.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.resume.domain.event.ResumeParsedEvent;
import com.graphhire.resume.domain.event.ResumeUploadedEvent;
import com.graphhire.resume.domain.vo.ParseStatus;

public class Resume extends BaseAggregateRoot {
    private Long id;
    private Long userId;
    private String fileName;
    private String filePath;
    private ParseStatus status;
    private String parseResult;
    private Integer retryCount = 0;

    public void upload(String filePath, String fileName) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.status = ParseStatus.PENDING;
        this.registerEvent(new ResumeUploadedEvent(this));
    }

    public void markParsing() {
        this.status = ParseStatus.PARSING;
    }

    public void parsed(String result) {
        this.parseResult = result;
        this.status = ParseStatus.SUCCESS;
        this.registerEvent(new ResumeParsedEvent(this));
    }

    public void parseFailed(String errorMessage) {
        this.status = ParseStatus.FAILED;
        this.retryCount++;
        if (this.retryCount >= 3) {
            throw new RuntimeException("重试次数已达上限");
        }
    }

    public boolean canRetry() {
        return this.retryCount < 3;
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

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public ParseStatus getStatus() {
        return status;
    }

    public void setStatus(ParseStatus status) {
        this.status = status;
    }

    public String getParseResult() {
        return parseResult;
    }

    public void setParseResult(String parseResult) {
        this.parseResult = parseResult;
    }

    public Integer getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }
}
