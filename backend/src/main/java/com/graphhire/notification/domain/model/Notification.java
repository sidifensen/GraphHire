package com.graphhire.notification.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.notification.domain.vo.NotificationType;

import java.time.LocalDateTime;

/**
 * 通知领域模型
 *
 * 【模块说明】管理用户通知的完整生命周期，包括创建、已读/未读状态管理、内容更新。
 * 【关联实体】
 * - userId：所属用户ID
 * - type：通知类型（NotificationType枚举）
 * - title：通知标题
 * - content：通知内容
 * - isRead：已读状态
 * - readTime：已读时间
 * - metadata：扩展元数据（JSON格式，存储关联的附加数据）
 * - referenceId：关联业务ID（用于跳转等场景）
 * - createdAt：创建时间
 */
public class Notification extends BaseAggregateRoot {
    /** 通知ID（主键） */
    private Long id;
    /** 所属用户ID */
    private Long userId;
    /** 通知类型 */
    private NotificationType type;
    /** 通知标题 */
    private String title;
    /** 通知内容 */
    private String content;
    /** 已读状态：false-未读，true-已读 */
    private Boolean isRead = false;
    /** 已读时间 */
    private LocalDateTime readTime;
    /** 扩展元数据（JSON格式，用于存储关联数据） */
    private String metadata;
    /** 关联业务ID（可指向职位、简历、候选人等） */
    private Long referenceId;
    /** 创建时间 */
    private LocalDateTime createdAt;

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
