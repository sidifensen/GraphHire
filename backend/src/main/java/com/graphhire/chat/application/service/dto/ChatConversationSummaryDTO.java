package com.graphhire.chat.application.service.dto;

import java.time.LocalDateTime;

public record ChatConversationSummaryDTO(
    Long conversationId,
    Long jobId,
    String jobTitle,
    Long companyId,
    String companyName,
    Long recruiterUserId,
    Long candidateUserId,
    String candidateName,
    String candidateEmail,
    Integer candidateAge,
    Integer candidateGender,
    String candidateEducation,
    String recruiterName,
    Long lastMessageId,
    String lastMessagePreview,
    LocalDateTime lastMessageTime,
    long unreadCount
) {
}
