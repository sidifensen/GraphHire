package com.graphhire.resume.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.resume.domain.event.ResumeParsedEvent;
import com.graphhire.resume.domain.event.ResumeUploadedEvent;
import com.graphhire.resume.domain.vo.ParseStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 简历领域模型
 *
 * 【模块说明】管理候选人简历文档的完整生命周期，包括上传、解析、状态流转。
 *
 * 【状态机】
 * - PENDING：待解析
 * - PARSING：解析中
 * - SUCCESS：解析成功
 * - FAILED：解析失败
 *
 * 【事件发布】
 * - upload()：发布 ResumeUploadedEvent
 * - parsed()：发布 ResumeParsedEvent
 *
 * 【关联实体】
 * - userId：上传用户
 * - filePath：存储路径（RustFS）
 * - parseResult：AI解析结果JSON
 */
public class Resume extends BaseAggregateRoot {
    /** 简历ID */
    private Long id;
    /** 上传用户ID */
    private Long userId;
    /** 文件名称 */
    private String fileName;
    /** 文件存储路径（RustFS S3路径） */
    private String filePath;
    /** 文件类型（MIME type） */
    private String fileType;
    /** 文件大小（字节） */
    private Long fileSize;
    /** 解析状态 */
    private ParseStatus status;
    /** AI解析结果（JSON格式） */
    private String parseResult;
    /** 解析失败错误信息 */
    private String parseError;
    /** AI解析置信度 */
    private BigDecimal confidence;
    /** 是否为默认简历 */
    private Boolean isDefault;
    /** 创建时间 */
    private LocalDateTime createTime;
    /** 更新时间 */
    private LocalDateTime updateTime;

    /**
     * 上传简历
     * 设置文件路径和名称，状态设为待解析，发布上传事件
     */
    public void upload(String filePath, String fileName) {
        this.filePath = filePath;
        this.fileName = fileName;
        this.status = ParseStatus.PENDING;
        this.registerEvent(new ResumeUploadedEvent(this));
    }

    /** 标记为解析中状态 */
    public void markParsing() {
        this.status = ParseStatus.PARSING;
    }

    /**
     * 标记解析成功
     * 设置解析结果，状态设为成功，发布解析完成事件
     */
    public void parsed(String result) {
        this.parseResult = result;
        this.status = ParseStatus.SUCCESS;
        this.registerEvent(new ResumeParsedEvent(this));
    }

    /** 标记解析失败，设置错误信息 */
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

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}
