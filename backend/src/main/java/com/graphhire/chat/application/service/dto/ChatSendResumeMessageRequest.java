package com.graphhire.chat.application.service.dto;

public class ChatSendResumeMessageRequest {
    private Long conversationId;
    private Long resumeId;

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }
}
