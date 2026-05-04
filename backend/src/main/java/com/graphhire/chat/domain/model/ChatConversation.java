package com.graphhire.chat.domain.model;

import java.time.LocalDateTime;

public class ChatConversation {
    public static final short STATUS_ACTIVE = 1;
    public static final short STATUS_CLOSED = 2;

    private Long id;
    private Long jobId;
    private Long companyId;
    private Long recruiterUserId;
    private Long candidateUserId;
    private Short status;
    private Long lastMessageId;
    private Long recruiterLastReadMsgId;
    private Long candidateLastReadMsgId;
    private LocalDateTime createTime;
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
