package com.graphhire.chat.application.service.dto;

import java.time.LocalDateTime;

public record ChatMessageDTO(
    Long id,
    Long conversationId,
    Long senderUserId,
    Long receiverUserId,
    short messageType,
    String content,
    String ext,
    int recalled,
    LocalDateTime createTime
) {
}
