package com.graphhire.chat.interfaces.ws;

import cn.hutool.json.JSONUtil;
import com.graphhire.common.vo.Exceptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private ChatSessionRegistry sessionRegistry;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = sessionUserId(session);
        sessionRegistry.register(userId, session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = sessionUserId(session);
        sessionRegistry.unregister(userId, session);
    }

    public void pushToUser(Long userId, Map<String, Object> payload) {
        String json = JSONUtil.toJsonStr(payload);
        for (WebSocketSession session : sessionRegistry.findUserSessions(userId)) {
            if (!session.isOpen()) {
                continue;
            }
            try {
                session.sendMessage(new TextMessage(json));
            } catch (IOException ignored) {
            }
        }
    }

    private Long sessionUserId(WebSocketSession session) {
        Object raw = session.getAttributes().get("chatUserId");
        if (!(raw instanceof Long userId)) {
            throw new Exceptions.UnauthorizedException("WS会话缺少用户信息");
        }
        return userId;
    }
}
