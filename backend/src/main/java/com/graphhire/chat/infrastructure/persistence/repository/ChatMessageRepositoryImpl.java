package com.graphhire.chat.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.chat.domain.model.ChatMessage;
import com.graphhire.chat.domain.model.ChatMessageType;
import com.graphhire.chat.domain.repository.ChatMessageRepository;
import com.graphhire.chat.infrastructure.persistence.mapper.ChatMessageMapper;
import com.graphhire.chat.infrastructure.persistence.po.ChatMessagePO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ChatMessageRepositoryImpl implements ChatMessageRepository {

    @Autowired
    private ChatMessageMapper mapper;

    @Override
    public Optional<ChatMessage> findById(Long id) {
        ChatMessagePO po = mapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<ChatMessage> findLatestByConversationId(Long conversationId, int size) {
        LambdaQueryWrapper<ChatMessagePO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatMessagePO::getConversationId, conversationId)
            .eq(ChatMessagePO::getDeleted, 0)
            .orderByDesc(ChatMessagePO::getId)
            .last("LIMIT " + Math.max(size, 1));
        return mapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public List<ChatMessage> findByConversationIdBeforeMessageId(Long conversationId, Long beforeMessageId, int size) {
        LambdaQueryWrapper<ChatMessagePO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ChatMessagePO::getConversationId, conversationId)
            .lt(beforeMessageId != null, ChatMessagePO::getId, beforeMessageId)
            .eq(ChatMessagePO::getDeleted, 0)
            .orderByDesc(ChatMessagePO::getId)
            .last("LIMIT " + Math.max(size, 1));
        return mapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public ChatMessage save(ChatMessage message) {
        ChatMessagePO po = toPO(message);
        if (message.getId() == null) {
            mapper.insert(po);
            message.setId(po.getId());
        } else {
            mapper.updateById(po);
        }
        return message;
    }

    private ChatMessage toDomain(ChatMessagePO po) {
        ChatMessage domain = new ChatMessage();
        BeanUtil.copyProperties(po, domain);
        if (po.getMessageType() != null) {
            domain.setMessageType(ChatMessageType.fromCode(po.getMessageType()));
        }
        return domain;
    }

    private ChatMessagePO toPO(ChatMessage domain) {
        ChatMessagePO po = new ChatMessagePO();
        BeanUtil.copyProperties(domain, po);
        if (domain.getMessageType() != null) {
            po.setMessageType(domain.getMessageType().getCode());
        }
        return po;
    }
}
