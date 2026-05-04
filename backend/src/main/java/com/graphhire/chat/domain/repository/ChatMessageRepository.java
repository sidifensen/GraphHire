package com.graphhire.chat.domain.repository;

import com.graphhire.chat.domain.model.ChatMessage;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository {
    Optional<ChatMessage> findById(Long id);

    List<ChatMessage> findLatestByConversationId(Long conversationId, int size);

    List<ChatMessage> findByConversationIdBeforeMessageId(Long conversationId, Long beforeMessageId, int size);

    ChatMessage save(ChatMessage message);
}
