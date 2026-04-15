package com.graphhire.notification.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import com.graphhire.notification.domain.vo.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationAppService {

    private final NotificationRepository repository;

    @Autowired
    public NotificationAppService(NotificationRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Notification create(Long userId, NotificationType type, String content) {
        return create(userId, type, type.getTitle(), content);
    }

    @Transactional
    public Notification create(Long userId, NotificationType type, String title, String content) {
        Notification notification = new Notification(userId, type, title, content);
        return repository.save(notification);
    }

    @Transactional
    public Notification create(Long userId, NotificationType type, String title, String content, String metadata) {
        Notification notification = new Notification(userId, type, title, content);
        notification.setMetadata(metadata);
        return repository.save(notification);
    }

    @Transactional
    public Notification create(Long userId, NotificationType type, String title, String content, Long referenceId) {
        Notification notification = new Notification(userId, type, title, content);
        notification.setReferenceId(referenceId);
        return repository.save(notification);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = repository.findById(notificationId)
            .orElseThrow(() -> new Exceptions.BusinessException("Notification not found: " + notificationId));
        notification.markAsRead();
        repository.save(notification);
    }

    @Transactional
    public void markAsUnread(Long notificationId) {
        Notification notification = repository.findById(notificationId)
            .orElseThrow(() -> new Exceptions.BusinessException("Notification not found: " + notificationId));
        notification.markAsUnread();
        repository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        repository.markAllAsReadByUserId(userId);
    }

    public Notification getNotification(Long notificationId) {
        return repository.findById(notificationId)
            .orElseThrow(() -> new Exceptions.BusinessException("Notification not found: " + notificationId));
    }

    public List<Notification> getUserNotifications(Long userId) {
        return repository.findByUserId(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return repository.findUnreadByUserId(userId);
    }

    public List<Notification> getNotificationsByType(Long userId, NotificationType type) {
        return repository.findByUserIdAndType(userId, type);
    }

    public long getUnreadCount(Long userId) {
        return repository.countUnreadByUserId(userId);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        Notification notification = repository.findById(notificationId)
            .orElseThrow(() -> new Exceptions.BusinessException("Notification not found: " + notificationId));
        repository.delete(notification);
    }
}
