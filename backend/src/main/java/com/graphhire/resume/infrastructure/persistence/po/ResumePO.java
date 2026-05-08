package com.graphhire.resume.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 简历持久化对象
 * 对应数据库 resume 表
 */
@TableName(value = "resume", autoResultMap = true)
public class ResumePO {
    /** 简历ID（自增） */
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 上传用户ID */
    @TableField("user_id")
    private Long userId;
    /** 文件名称 */
    @TableField("file_name")
    private String fileName;
    /** 文件存储路径 */
    @TableField("file_path")
    private String filePath;
    /** 文件类型（MIME type） */
    @TableField("file_type")
    private String fileType;
    /** 文件大小（字节） */
    @TableField("file_size")
    private Long fileSize;
    /** 解析状态（0:待解析,1:解析中,2:成功,3:失败） */
    @TableField("parse_status")
    private Integer parseStatus;
    /** AI解析结果（JSON格式） */
    @TableField(value = "parse_result", typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> parseResult;
    /** 解析失败错误信息（数据库中不存在） */
    @TableField(exist = false)
    private String parseError;
    /** AI解析置信度（数据库中不存在） */
    @TableField(exist = false)
    private Double confidence;
    /** 是否为默认简历 */
    @TableField("is_default")
    private Integer isDefault;
    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;
    /** 更新时间 */
    @TableField("update_time")
    private LocalDateTime updateTime;
    /** 逻辑删除标记 */
    @TableField("deleted")
    @TableLogic
    private Integer deleted;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public Integer getParseStatus() { return parseStatus; }
    public void setParseStatus(Integer parseStatus) { this.parseStatus = parseStatus; }

    public Map<String, Object> getParseResult() { return parseResult; }
    public void setParseResult(Map<String, Object> parseResult) { this.parseResult = parseResult; }

    public String getParseError() { return parseError; }
    public void setParseError(String parseError) { this.parseError = parseError; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public Integer getIsDefault() { return isDefault; }
    public void setIsDefault(Integer isDefault) { this.isDefault = isDefault; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }

    public Integer getDeleted() { return deleted; }
    public void setDeleted(Integer deleted) { this.deleted = deleted; }
}
