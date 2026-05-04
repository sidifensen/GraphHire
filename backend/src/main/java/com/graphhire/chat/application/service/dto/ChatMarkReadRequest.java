package com.graphhire.chat.application.service.dto;

public class ChatMarkReadRequest {
    private Long conversationId;
    private Long readUpToMessageId;

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getReadUpToMessageId() {
        return readUpToMessageId;
    }

    public void setReadUpToMessageId(Long readUpToMessageId) {
        this.readUpToMessageId = readUpToMessageId;
    }
}
