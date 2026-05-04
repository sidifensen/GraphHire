package com.graphhire.chat.interfaces.ws;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class ChatSessionRegistry {

    private final Map<Long, CopyOnWriteArrayList<WebSocketSession>> sessionsByUserId = new ConcurrentHashMap<>();

    public void register(Long userId, WebSocketSession session) {
        sessionsByUserId.computeIfAbsent(userId, ignored -> new CopyOnWriteArrayList<>()).add(session);
    }

    public void unregister(Long userId, WebSocketSession session) {
        if (userId == null) {
            return;
        }
        List<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null) {
            return;
        }
        sessions.remove(session);
        if (sessions.isEmpty()) {
            sessionsByUserId.remove(userId);
        }
    }

    public List<WebSocketSession> findUserSessions(Long userId) {
        return sessionsByUserId.getOrDefault(userId, new CopyOnWriteArrayList<>());
    }

    public void closeAll() {
        sessionsByUserId.values().forEach(list -> list.forEach(session -> {
            try {
                if (session.isOpen()) {
                    session.close();
                }
            } catch (IOException ignored) {
            }
        }));
        sessionsByUserId.clear();
    }
}
