package com.graphhire.notification.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import com.graphhire.notification.domain.vo.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 通知应用服务
 *
 * 【模块说明】提供通知业务的聚合操作入口，协调领域模型与仓储进行业务处理。
 * 【数据来源】通过 NotificationRepository 访问持久化数据
 * 【方法概览】
 * - create*：创建通知（多种重载形式）
 * - markAsRead/markAsUnread：标记单条通知已读/未读
 * - markAllAsRead：批量标记用户所有通知已读
 * - get*：查询通知（单个、列表、未读、分类）
 * - deleteNotification：删除通知
 */
@Service
public class NotificationAppService {

    private final NotificationRepository repository;

    @Autowired
    public NotificationAppService(NotificationRepository repository) {
        this.repository = repository;
    }

    /**
     * 创建通知（使用默认标题）
     * 【功能说明】使用通知类型默认标题创建通知，适用于内容驱动的简单通知场景。
     * 【业务步骤】
     * 步骤1：调用完整参数create方法，传入类型默认标题
     * @param userId 用户ID
     * @param type 通知类型
     * @param content 通知内容
     * @return 创建的通知对象
     */
    @Transactional
    public Notification create(Long userId, NotificationType type, String content) {
        return create(userId, type, type.getTitle(), content);
    }

    /**
     * 创建通知
     * 【功能说明】构建通知对象并持久化。
     * 【业务步骤】
     * 步骤1：创建通知领域模型实例
     * 步骤2：调用仓储保存
     */
    @Transactional
    public Notification create(Long userId, NotificationType type, String title, String content) {
        // 步骤1：构建通知对象
        Notification notification = new Notification(userId, type, title, content);
        // 步骤2：持久化保存
        return repository.save(notification);
    }

    /**
     * 创建通知（带扩展元数据）
     * 【功能说明】创建通知并附加JSON格式的扩展元数据，用于存储额外业务信息。
     * 【业务步骤】
     * 步骤1：构建通知对象
     * 步骤2：设置扩展元数据
     * 步骤3：调用仓储保存
     * @param userId 用户ID
     * @param type 通知类型
     * @param title 通知标题
     * @param content 通知内容
     * @param metadata 扩展元数据（JSON格式）
     * @return 创建的通知对象
     */
    @Transactional
    public Notification create(Long userId, NotificationType type, String title, String content, String metadata) {
        Notification notification = new Notification(userId, type, title, content);
        notification.setMetadata(metadata);
        return repository.save(notification);
    }

    /**
     * 创建通知（带关联业务ID）
     * 【功能说明】创建通知并关联业务对象ID，便于后续跳转和业务关联。
     * 【业务步骤】
     * 步骤1：构建通知对象
     * 步骤2：设置关联业务ID
     * 步骤3：调用仓储保存
     * @param userId 用户ID
     * @param type 通知类型
     * @param title 通知标题
     * @param content 通知内容
     * @param referenceId 关联业务ID
     * @return 创建的通知对象
     */
    @Transactional
    public Notification create(Long userId, NotificationType type, String title, String content, Long referenceId) {
        Notification notification = new Notification(userId, type, title, content);
        notification.setReferenceId(referenceId);
        return repository.save(notification);
    }

    /**
     * 标记通知为已读
     * 【功能说明】将指定通知标记为已读状态，同时设置已读时间。
     * 【业务步骤】
     * 步骤1：根据ID查询通知，不存在则抛异常
     * 步骤2：调用领域模型的 markAsRead 方法
     * 步骤3：保存更新后的通知
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        // 步骤1：查询通知
        Notification notification = repository.findById(notificationId)
            .orElseThrow(() -> new Exceptions.BusinessException("Notification not found: " + notificationId));
        // 步骤2：标记已读
        notification.markAsRead();
        // 步骤3：保存更新
        repository.save(notification);
    }

    /**
     * 标记通知为未读
     * 【功能说明】将指定通知恢复为未读状态，清除已读时间。
     * 【业务步骤】
     * 步骤1：根据ID查询通知，不存在则抛异常
     * 步骤2：调用领域模型的 markAsUnread 方法
     * 步骤3：保存更新后的通知
     */
    @Transactional
    public void markAsUnread(Long notificationId) {
        // 步骤1：查询通知
        Notification notification = repository.findById(notificationId)
            .orElseThrow(() -> new Exceptions.BusinessException("Notification not found: " + notificationId));
        // 步骤2：标记未读
        notification.markAsUnread();
        // 步骤3：保存更新
        repository.save(notification);
    }

    /**
     * 标记用户所有通知为已读（批量操作）
     * 【功能说明】将指定用户的所有通知批量标记为已读状态。
     * 【业务步骤】
     * 步骤1：调用仓储批量更新用户未读通知状态
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        repository.markAllAsReadByUserId(userId);
    }

    /**
     * 获取单条通知
     * 【功能说明】根据通知ID查询单条通知详情。
     * 【业务步骤】
     * 步骤1：调用仓储根据ID查询通知
     * 步骤2：不存在则抛业务异常
     * @param notificationId 通知ID
     * @return 通知对象
     */
    public Notification getNotification(Long notificationId) {
        return repository.findById(notificationId)
            .orElseThrow(() -> new Exceptions.BusinessException("Notification not found: " + notificationId));
    }

    /**
     * 获取用户所有通知
     * 【功能说明】查询指定用户的所有通知列表，按创建时间倒序排列。
     * 【业务步骤】
     * 步骤1：调用仓储根据用户ID查询通知列表
     * @param userId 用户ID
     * @return 通知列表
     */
    public List<Notification> getUserNotifications(Long userId) {
        return repository.findByUserId(userId);
    }

    /**
     * 获取用户未读通知
     * 【功能说明】查询指定用户的所有未读通知列表。
     * 【业务步骤】
     * 步骤1：调用仓储根据用户ID查询未读通知列表
     * @param userId 用户ID
     * @return 未读通知列表
     */
    public List<Notification> getUnreadNotifications(Long userId) {
        return repository.findUnreadByUserId(userId);
    }

    /**
     * 按类型获取用户通知
     * 【功能说明】查询指定用户且符合特定类型的通知列表。
     * 【业务步骤】
     * 步骤1：调用仓储根据用户ID和通知类型查询通知列表
     * @param userId 用户ID
     * @param type 通知类型
     * @return 通知列表
     */
    public List<Notification> getNotificationsByType(Long userId, NotificationType type) {
        return repository.findByUserIdAndType(userId, type);
    }

    /**
     * 获取用户未读通知数量
     * 【功能说明】统计指定用户的未读通知总数。
     * 【业务步骤】
     * 步骤1：调用仓储统计用户未读通知数量
     * @param userId 用户ID
     * @return 未读通知数量
     */
    public long getUnreadCount(Long userId) {
        return repository.countUnreadByUserId(userId);
    }

    /**
     * 删除通知
     * 【业务步骤】
     * 步骤1：根据ID查询通知，不存在则抛异常
     * 步骤2：调用仓储删除
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        // 步骤1：查询通知
        Notification notification = repository.findById(notificationId)
            .orElseThrow(() -> new Exceptions.BusinessException("Notification not found: " + notificationId));
        // 步骤2：删除
        repository.delete(notification);
    }

    /**
     * 删除用户已读通知
     */
    @Transactional
    public void deleteReadNotifications(Long userId) {
        repository.deleteReadByUserId(userId);
    }
}
