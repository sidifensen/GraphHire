package com.graphhire.notification.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.notification.domain.vo.NotificationType;

import java.time.LocalDateTime;

public class Notification extends BaseAggregateRoot {
    private Long id;
    private Long userId;
    private NotificationType type;
    private String title;
    private String content;
    private Boolean isRead = false;
    private LocalDateTime readTime;
    private String metadata; // JSON string for additional data
    private Long referenceId; // maps to related_id in database
    private LocalDateTime createdAt; // maps to create_time in database

    public Notification() {
    }

    public Notification(Long userId, NotificationType type, String title, String content) {
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.content = content;
        this.isRead = false;
    }

    public void markAsRead() {
        this.isRead = true;
        this.readTime = LocalDateTime.now();
    }

    public void markAsUnread() {
        this.isRead = false;
        this.readTime = null;
    }

    public boolean isRead() {
        return this.isRead;
    }

    public void updateContent(String newContent) {
        this.content = newContent;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public String getMetadata() {
        return metadata;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getReadTime() {
        return readTime;
    }

    public void setReadTime(LocalDateTime readTime) {
        this.readTime = readTime;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
