package com.graphhire.chat.domain.repository;

import com.graphhire.chat.domain.model.ChatConversation;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ChatConversationRepository {
    Optional<ChatConversation> findById(Long id);

    Optional<ChatConversation> findByJobIdAndCandidateUserId(Long jobId, Long candidateUserId);

    List<ChatConversation> findByRecruiterUserId(Long recruiterUserId);

    /**
     * 按招聘者与岗位集合批量统计会话数。
     * 说明：用于企业岗位列表和看板聚合，避免循环内全量查询后再过滤。
     */
    Map<Long, Long> countByRecruiterAndJobIds(Long recruiterUserId, List<Long> jobIds);

    List<ChatConversation> findByCandidateUserId(Long candidateUserId);

    ChatConversation save(ChatConversation conversation);
}
