package com.graphhire.chat.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("chat_conversation")
public class ChatConversationPO {
    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("job_id")
    private Long jobId;
    @TableField("company_id")
    private Long companyId;
    @TableField("recruiter_user_id")
    private Long recruiterUserId;
    @TableField("candidate_user_id")
    private Long candidateUserId;
    private Short status;
    @TableField("last_message_id")
    private Long lastMessageId;
    @TableField("recruiter_last_read_msg_id")
    private Long recruiterLastReadMsgId;
    @TableField("candidate_last_read_msg_id")
    private Long candidateLastReadMsgId;
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

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public Long getRecruiterUserId() {
        return recruiterUserId;
    }

    public void setRecruiterUserId(Long recruiterUserId) {
        this.recruiterUserId = recruiterUserId;
    }

    public Long getCandidateUserId() {
        return candidateUserId;
    }

    public void setCandidateUserId(Long candidateUserId) {
        this.candidateUserId = candidateUserId;
    }

    public Short getStatus() {
        return status;
    }

    public void setStatus(Short status) {
        this.status = status;
    }

    public Long getLastMessageId() {
        return lastMessageId;
    }

    public void setLastMessageId(Long lastMessageId) {
        this.lastMessageId = lastMessageId;
    }

    public Long getRecruiterLastReadMsgId() {
        return recruiterLastReadMsgId;
    }

    public void setRecruiterLastReadMsgId(Long recruiterLastReadMsgId) {
        this.recruiterLastReadMsgId = recruiterLastReadMsgId;
    }

    public Long getCandidateLastReadMsgId() {
        return candidateLastReadMsgId;
    }

    public void setCandidateLastReadMsgId(Long candidateLastReadMsgId) {
        this.candidateLastReadMsgId = candidateLastReadMsgId;
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
