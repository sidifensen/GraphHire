package com.graphhire.notification.domain.repository;

import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.vo.NotificationType;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository {
    Optional<Notification> findById(Long id);

    List<Notification> findByUserId(Long userId);

    List<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead);

    List<Notification> findByUserIdAndType(Long userId, NotificationType type);

    List<Notification> findUnreadByUserId(Long userId);

    Notification save(Notification notification);

    void delete(Notification notification);

    long countUnreadByUserId(Long userId);

    void markAllAsReadByUserId(Long userId);
}
