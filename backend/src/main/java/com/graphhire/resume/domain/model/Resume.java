package com.graphhire.resume.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.resume.domain.event.ResumeParsedEvent;
import com.graphhire.resume.domain.event.ResumeUploadedEvent;
import com.graphhire.resume.domain.vo.ParseStatus;

import java.math.BigDecimal;

public class Resume extends BaseAggregateRoot {
    private Long id;
    private Long userId;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private ParseStatus status;
    private String parseResult;
    private String parseError;
    private BigDecimal confidence;
    private Boolean isDefault;

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
        this.parseError = errorMessage;
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

    public String getParseError() {
        return parseError;
    }

    public void setParseError(String parseError) {
        this.parseError = parseError;
    }

    public BigDecimal getConfidence() {
        return confidence;
    }

    public void setConfidence(BigDecimal confidence) {
        this.confidence = confidence;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}
