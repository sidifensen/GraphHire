package com.graphhire.domain.repository;

import com.graphhire.domain.model.Notification;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository {
    Notification findById(Long id);
    Optional<Notification> findByIdOptional(Long id);
    List<Notification> findByUserId(Long userId);
    List<Notification> findByUserId(Long userId, Integer page, Integer pageSize);
    List<Notification> findUnreadByUserId(Long userId);
    Notification save(Notification notification);
    void markAsRead(Long id);
    int countUnread(Long userId);
}
