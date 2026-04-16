package com.graphhire.notification.interfaces.controller;

import com.graphhire.common.vo.Result;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.vo.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 通知接口控制器
 * 提供通知的 RESTful API 接口，供前端调用
 */
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationAppService appService;

    @Autowired
    public NotificationController(NotificationAppService appService) {
        this.appService = appService;
    }

    /**
     * 获取单条通知
     * @param id 通知ID
     * @return 通知详情
     */
    @GetMapping("/{id}")
    public Result<Notification> getNotification(@PathVariable Long id) {
        Notification notification = appService.getNotification(id);
        return Result.success(notification);
    }

    /**
     * 获取用户所有通知
     * @param userId 用户ID
     * @return 通知列表（按创建时间倒序）
     */
    @GetMapping("/user/{userId}")
    public Result<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = appService.getUserNotifications(userId);
        return Result.success(notifications);
    }

    /**
     * 获取用户未读通知
     * @param userId 用户ID
     * @return 未读通知列表
     */
    @GetMapping("/user/{userId}/unread")
    public Result<List<Notification>> getUnreadNotifications(@PathVariable Long userId) {
        List<Notification> notifications = appService.getUnreadNotifications(userId);
        return Result.success(notifications);
    }

    /**
     * 按类型获取用户通知
     * @param userId 用户ID
     * @param type 通知类型
     * @return 该类型的通知列表
     */
    @GetMapping("/user/{userId}/type/{type}")
    public Result<List<Notification>> getNotificationsByType(
            @PathVariable Long userId,
            @PathVariable NotificationType type) {
        List<Notification> notifications = appService.getNotificationsByType(userId, type);
        return Result.success(notifications);
    }

    /**
     * 获取用户未读通知数量
     * @param userId 用户ID
     * @return 未读数量
     */
    @GetMapping("/user/{userId}/unread-count")
    public Result<Long> getUnreadCount(@PathVariable Long userId) {
        long count = appService.getUnreadCount(userId);
        return Result.success(count);
    }

    /**
     * 标记通知为已读
     * @param id 通知ID
     * @return void
     */
    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id) {
        appService.markAsRead(id);
        return Result.success();
    }

    /**
     * 标记通知为未读
     * @param id 通知ID
     * @return void
     */
    @PutMapping("/{id}/unread")
    public Result<Void> markAsUnread(@PathVariable Long id) {
        appService.markAsUnread(id);
        return Result.success();
    }

    /**
     * 标记用户所有通知为已读
     * @param userId 用户ID
     * @return void
     */
    @PutMapping("/user/{userId}/read-all")
    public Result<Void> markAllAsRead(@PathVariable Long userId) {
        appService.markAllAsRead(userId);
        return Result.success();
    }

    /**
     * 删除通知
     * @param id 通知ID
     * @return void
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteNotification(@PathVariable Long id) {
        appService.deleteNotification(id);
        return Result.success();
    }
}
