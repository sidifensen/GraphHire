package com.graphhire.notification.domain.repository;

import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.vo.NotificationType;

import java.util.List;
import java.util.Optional;

/**
 * 通知仓储接口
 * 定义通知数据的持久化操作规范
 */
public interface NotificationRepository {
    /** 根据ID查询通知 */
    Optional<Notification> findById(Long id);

    /** 查询用户的所有通知（按创建时间倒序） */
    List<Notification> findByUserId(Long userId);

    /** 根据用户ID和已读状态查询通知 */
    List<Notification> findByUserIdAndIsRead(Long userId, Boolean isRead);

    /** 根据用户ID和通知类型查询通知 */
    List<Notification> findByUserIdAndType(Long userId, NotificationType type);

    /** 查询用户的未读通知 */
    List<Notification> findUnreadByUserId(Long userId);

    /** 保存通知（新增或更新） */
    Notification save(Notification notification);

    /** 删除通知 */
    void delete(Notification notification);

    /** 统计用户未读通知数量 */
    long countUnreadByUserId(Long userId);

    /** 将用户所有通知标记为已读 */
    void markAllAsReadByUserId(Long userId);
}
