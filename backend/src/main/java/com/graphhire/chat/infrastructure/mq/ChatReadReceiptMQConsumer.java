package com.graphhire.chat.infrastructure.mq;

import cn.hutool.json.JSONUtil;
import cn.hutool.json.JSONObject;
import com.graphhire.chat.domain.model.ChatConversation;
import com.graphhire.chat.domain.repository.ChatConversationRepository;
import com.graphhire.chat.interfaces.ws.ChatWebSocketHandler;
import org.apache.rocketmq.spring.annotation.RocketMQMessageListener;
import org.apache.rocketmq.spring.core.RocketMQListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
@RocketMQMessageListener(topic = "chat-read-receipt", consumerGroup = "chat-read-receipt-consumer")
public class ChatReadReceiptMQConsumer implements RocketMQListener<String> {

    @Autowired
    private ChatConversationRepository conversationRepository;
    @Autowired
    private ChatWebSocketHandler chatWebSocketHandler;

    @Override
    public void onMessage(String message) {
        JSONObject json = JSONUtil.parseObj(message);
        Long conversationId = json.getLong("conversationId");
        Long readerUserId = json.getLong("readerUserId");
        Long readUpToMessageId = json.getLong("readUpToMessageId");
        if (conversationId == null || readerUserId == null || readUpToMessageId == null) {
            return;
        }
        ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
        if (conversation == null) {
            return;
        }
        Long peerUserId = readerUserId.equals(conversation.getRecruiterUserId())
            ? conversation.getCandidateUserId()
            : conversation.getRecruiterUserId();
        Map<String, Object> payload = new HashMap<>();
        payload.put("event", "READ_RECEIPT");
        payload.put("conversationId", conversationId);
        payload.put("readerUserId", readerUserId);
        payload.put("readUpToMessageId", readUpToMessageId);
        payload.put("createdAt", json.getStr("createdAt"));
        chatWebSocketHandler.pushToUser(peerUserId, payload);
    }
}
