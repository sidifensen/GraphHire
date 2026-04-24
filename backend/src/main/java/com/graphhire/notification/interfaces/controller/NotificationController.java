package com.graphhire.notification.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.common.vo.Result;
import com.graphhire.notification.application.service.NotificationAppService;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.vo.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationAppService appService;

    @Autowired
    public NotificationController(NotificationAppService appService) {
        this.appService = appService;
    }

    private Long currentUserId() {
        return StpUtil.getLoginIdAsLong();
    }

    private void ensureSelf(Long userId) {
        Long currentUserId = currentUserId();
        if (!currentUserId.equals(userId)) {
            throw new com.graphhire.common.vo.Exceptions.ForbiddenException("无权访问他人通知");
        }
    }

    @GetMapping("/me")
    public Result<List<Notification>> getMyNotifications() {
        return Result.success(appService.getUserNotifications(currentUserId()));
    }

    @GetMapping("/me/unread")
    public Result<List<Notification>> getMyUnreadNotifications() {
        return Result.success(appService.getUnreadNotifications(currentUserId()));
    }

    @GetMapping("/me/type/{type}")
    public Result<List<Notification>> getMyNotificationsByType(@PathVariable NotificationType type) {
        return Result.success(appService.getNotificationsByType(currentUserId(), type));
    }

    @GetMapping("/me/unread-count")
    public Result<Long> getMyUnreadCount() {
        return Result.success(appService.getUnreadCount(currentUserId()));
    }

    @PutMapping("/me/read-all")
    public Result<Void> markMyNotificationsAsRead() {
        appService.markAllAsRead(currentUserId());
        return Result.success();
    }

    @DeleteMapping("/me/read")
    public Result<Void> deleteMyReadNotifications() {
        appService.deleteReadNotifications(currentUserId());
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Notification> getNotification(@PathVariable Long id) {
        Notification notification = appService.getNotification(id, currentUserId());
        return Result.success(notification);
    }

    @GetMapping("/user/{userId}")
    public Result<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        ensureSelf(userId);
        List<Notification> notifications = appService.getUserNotifications(userId);
        return Result.success(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    public Result<List<Notification>> getUnreadNotifications(@PathVariable Long userId) {
        ensureSelf(userId);
        List<Notification> notifications = appService.getUnreadNotifications(userId);
        return Result.success(notifications);
    }

    @GetMapping("/user/{userId}/type/{type}")
    public Result<List<Notification>> getNotificationsByType(
            @PathVariable Long userId,
            @PathVariable NotificationType type) {
        ensureSelf(userId);
        List<Notification> notifications = appService.getNotificationsByType(userId, type);
        return Result.success(notifications);
    }

    @GetMapping("/user/{userId}/unread-count")
    public Result<Long> getUnreadCount(@PathVariable Long userId) {
        ensureSelf(userId);
        long count = appService.getUnreadCount(userId);
        return Result.success(count);
    }

    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id) {
        appService.markAsRead(id, currentUserId());
        return Result.success();
    }

    @PutMapping("/{id}/unread")
    public Result<Void> markAsUnread(@PathVariable Long id) {
        appService.markAsUnread(id, currentUserId());
        return Result.success();
    }

    @PutMapping("/user/{userId}/read-all")
    public Result<Void> markAllAsRead(@PathVariable Long userId) {
        ensureSelf(userId);
        appService.markAllAsRead(userId);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteNotification(@PathVariable Long id) {
        appService.deleteNotification(id, currentUserId());
        return Result.success();
    }
}
