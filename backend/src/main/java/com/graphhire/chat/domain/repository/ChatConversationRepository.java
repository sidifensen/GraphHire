package com.graphhire.chat.domain.repository;

import com.graphhire.chat.domain.model.ChatConversation;

import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository {
    Optional<ChatConversation> findById(Long id);

    Optional<ChatConversation> findByJobIdAndCandidateUserId(Long jobId, Long candidateUserId);

    List<ChatConversation> findByRecruiterUserId(Long recruiterUserId);

    List<ChatConversation> findByCandidateUserId(Long candidateUserId);

    ChatConversation save(ChatConversation conversation);
}
