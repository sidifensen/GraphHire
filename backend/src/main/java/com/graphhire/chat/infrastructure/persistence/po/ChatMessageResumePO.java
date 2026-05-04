package com.graphhire.chat.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("chat_message_resume")
public class ChatMessageResumePO {
    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("message_id")
    private Long messageId;
    @TableField("resume_id")
    private Long resumeId;
    @TableField("resume_owner_user_id")
    private Long resumeOwnerUserId;
    @TableField("snapshot_file_name")
    private String snapshotFileName;
    @TableField("snapshot_file_path")
    private String snapshotFilePath;
    @TableField("create_time")
    private LocalDateTime createTime;
    @TableField("update_time")
    private LocalDateTime updateTime;
    private Integer deleted;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public Long getResumeOwnerUserId() {
        return resumeOwnerUserId;
    }

    public void setResumeOwnerUserId(Long resumeOwnerUserId) {
        this.resumeOwnerUserId = resumeOwnerUserId;
    }

    public String getSnapshotFileName() {
        return snapshotFileName;
    }

    public void setSnapshotFileName(String snapshotFileName) {
        this.snapshotFileName = snapshotFileName;
    }

    public String getSnapshotFilePath() {
        return snapshotFilePath;
    }

    public void setSnapshotFilePath(String snapshotFilePath) {
        this.snapshotFilePath = snapshotFilePath;
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

    public Integer getDeleted() {
        return deleted;
    }

    public void setDeleted(Integer deleted) {
        this.deleted = deleted;
    }
}
