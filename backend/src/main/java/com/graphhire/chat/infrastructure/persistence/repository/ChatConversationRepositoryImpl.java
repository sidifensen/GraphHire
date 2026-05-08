package com.graphhire.chat.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.chat.domain.model.ChatConversation;
import com.graphhire.chat.domain.repository.ChatConversationRepository;
import com.graphhire.chat.infrastructure.persistence.mapper.ChatConversationMapper;
import com.graphhire.chat.infrastructure.persistence.po.ChatConversationPO;
import com.graphhire.chat.infrastructure.persistence.po.ChatConversationViewPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class ChatConversationRepositoryImpl implements ChatConversationRepository {

    @Autowired
    private ChatConversationMapper mapper;

    @Override
    public Optional<ChatConversation> findById(Long id) {
        ChatConversationPO po = mapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public Optional<ChatConversation> findByJobIdAndCandidateUserId(Long jobId, Long candidateUserId) {
        LambdaQueryWrapper<ChatConversationPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatConversationPO::getJobId, jobId)
            .eq(ChatConversationPO::getCandidateUserId, candidateUserId)
            .eq(ChatConversationPO::getDeleted, 0)
            .last("LIMIT 1");
        return Optional.ofNullable(mapper.selectOne(wrapper)).map(this::toDomain);
    }

    @Override
    public List<ChatConversation> findByRecruiterUserId(Long recruiterUserId) {
        LambdaQueryWrapper<ChatConversationPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatConversationPO::getRecruiterUserId, recruiterUserId)
            .eq(ChatConversationPO::getDeleted, 0)
            .orderByDesc(ChatConversationPO::getUpdateTime);
        return mapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    /**
     * 按招聘者和岗位集合批量统计会话数。
     * 说明：将岗位维度统计下沉到SQL层，避免业务层循环过滤造成额外开销。
     */
    @Override
    public Map<Long, Long> countByRecruiterAndJobIds(Long recruiterUserId, List<Long> jobIds) {
        if (recruiterUserId == null || jobIds == null || jobIds.isEmpty()) {
            return Map.of();
        }
        List<Map<String, Object>> rows = mapper.countByRecruiterAndJobIds(recruiterUserId, jobIds);
        Map<Long, Long> result = new HashMap<>();
        for (Map<String, Object> row : rows) {
            if (row == null) {
                continue;
            }
            Object jobIdObj = row.get("jobId");
            Object countObj = row.get("conversationCount");
            if (jobIdObj instanceof Number jobIdNumber && countObj instanceof Number countNumber) {
                result.put(jobIdNumber.longValue(), countNumber.longValue());
            }
        }
        return result;
    }

    @Override
    public List<ChatConversation> findByCandidateUserId(Long candidateUserId) {
        LambdaQueryWrapper<ChatConversationPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatConversationPO::getCandidateUserId, candidateUserId)
            .eq(ChatConversationPO::getDeleted, 0)
            .orderByDesc(ChatConversationPO::getUpdateTime);
        return mapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public ChatConversation save(ChatConversation conversation) {
        ChatConversationPO po = toPO(conversation);
        if (conversation.getId() == null) {
            mapper.insert(po);
            conversation.setId(po.getId());
        } else {
            mapper.updateById(po);
        }
        return conversation;
    }

    private ChatConversation toDomain(ChatConversationPO po) {
        ChatConversation domain = new ChatConversation();
        BeanUtil.copyProperties(po, domain);
        return domain;
    }

    private ChatConversationPO toPO(ChatConversation domain) {
        ChatConversationPO po = new ChatConversationPO();
        BeanUtil.copyProperties(domain, po);
        return po;
    }

    public List<ChatConversationViewPO> listViewByRecruiterUserId(Long recruiterUserId) {
        return mapper.listByRecruiterUserId(recruiterUserId);
    }

    public List<ChatConversationViewPO> listViewByCandidateUserId(Long candidateUserId) {
        return mapper.listByCandidateUserId(candidateUserId);
    }

    public long countUnread(Long conversationId, Long currentUserId, Long lastReadId) {
        return mapper.countUnread(conversationId, currentUserId, lastReadId);
    }
}
