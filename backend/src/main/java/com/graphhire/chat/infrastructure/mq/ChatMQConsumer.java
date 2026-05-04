package com.graphhire.chat.infrastructure.mq;

import cn.hutool.json.JSONUtil;
import cn.hutool.json.JSONObject;
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
@RocketMQMessageListener(topic = "chat-message", consumerGroup = "chat-message-consumer")
public class ChatMQConsumer implements RocketMQListener<String> {

    @Autowired
    private ChatWebSocketHandler chatWebSocketHandler;

    @Override
    public void onMessage(String message) {
        JSONObject json = JSONUtil.parseObj(message);
        Long receiverUserId = json.getLong("receiverUserId");
        if (receiverUserId == null) {
            return;
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("event", "MESSAGE_CREATED");
        payload.put("messageId", json.getLong("messageId"));
        payload.put("conversationId", json.getLong("conversationId"));
        payload.put("senderUserId", json.getLong("senderUserId"));
        payload.put("receiverUserId", receiverUserId);
        payload.put("createdAt", json.getStr("createdAt"));
        chatWebSocketHandler.pushToUser(receiverUserId, payload);
    }
}
