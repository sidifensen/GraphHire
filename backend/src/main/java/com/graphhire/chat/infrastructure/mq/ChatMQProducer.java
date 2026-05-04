package com.graphhire.chat.infrastructure.mq;

import cn.hutool.json.JSONUtil;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "rocketmq.enabled", havingValue = "true", matchIfMissing = false)
public class ChatMQProducer {

    private static final String TOPIC_CHAT_MESSAGE = "chat-message";
    private static final String TOPIC_CHAT_READ_RECEIPT = "chat-read-receipt";

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    public void sendMessageCreated(Long messageId, Long conversationId, Long senderUserId, Long receiverUserId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("messageId", messageId);
        payload.put("conversationId", conversationId);
        payload.put("senderUserId", senderUserId);
        payload.put("receiverUserId", receiverUserId);
        payload.put("createdAt", LocalDateTime.now().toString());
        rocketMQTemplate.convertAndSend(TOPIC_CHAT_MESSAGE, JSONUtil.toJsonStr(payload));
    }

    public void sendReadReceipt(Long conversationId, Long readerUserId, Long readUpToMessageId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("conversationId", conversationId);
        payload.put("readerUserId", readerUserId);
        payload.put("readUpToMessageId", readUpToMessageId);
        payload.put("createdAt", LocalDateTime.now().toString());
        rocketMQTemplate.convertAndSend(TOPIC_CHAT_READ_RECEIPT, JSONUtil.toJsonStr(payload));
    }
}
