package com.graphhire.chat.infrastructure.persistence.po;

import java.time.LocalDateTime;

public class ChatConversationViewPO {
    private Long conversationId;
    private Long jobId;
    private String jobTitle;
    private Long companyId;
    private String companyName;
    private Long recruiterUserId;
    private Long candidateUserId;
    private String candidateName;
    private String candidateEmail;
    private Integer candidateAge;
    private Integer candidateGender;
    private String candidateEducation;
    private String recruiterName;
    private Long lastMessageId;
    private String lastMessageContent;
    private LocalDateTime lastMessageTime;
    private Long recruiterLastReadMsgId;
    private Long candidateLastReadMsgId;
    private Long unreadCount;

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
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

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }

    public Integer getCandidateAge() {
        return candidateAge;
    }

    public void setCandidateAge(Integer candidateAge) {
        this.candidateAge = candidateAge;
    }

    public Integer getCandidateGender() {
        return candidateGender;
    }

    public void setCandidateGender(Integer candidateGender) {
        this.candidateGender = candidateGender;
    }

    public String getCandidateEducation() {
        return candidateEducation;
    }

    public void setCandidateEducation(String candidateEducation) {
        this.candidateEducation = candidateEducation;
    }

    public String getRecruiterName() {
        return recruiterName;
    }

    public void setRecruiterName(String recruiterName) {
        this.recruiterName = recruiterName;
    }

    public Long getLastMessageId() {
        return lastMessageId;
    }

    public void setLastMessageId(Long lastMessageId) {
        this.lastMessageId = lastMessageId;
    }

    public String getLastMessageContent() {
        return lastMessageContent;
    }

    public void setLastMessageContent(String lastMessageContent) {
        this.lastMessageContent = lastMessageContent;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
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

    public Long getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(Long unreadCount) {
        this.unreadCount = unreadCount;
    }
}
