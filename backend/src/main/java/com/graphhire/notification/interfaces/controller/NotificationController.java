package com.graphhire.notification.interfaces.controller;

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

    @GetMapping("/{id}")
    public Result<Notification> getNotification(@PathVariable Long id) {
        Notification notification = appService.getNotification(id);
        return Result.success(notification);
    }

    @GetMapping("/user/{userId}")
    public Result<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = appService.getUserNotifications(userId);
        return Result.success(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    public Result<List<Notification>> getUnreadNotifications(@PathVariable Long userId) {
        List<Notification> notifications = appService.getUnreadNotifications(userId);
        return Result.success(notifications);
    }

    @GetMapping("/user/{userId}/type/{type}")
    public Result<List<Notification>> getNotificationsByType(
            @PathVariable Long userId,
            @PathVariable NotificationType type) {
        List<Notification> notifications = appService.getNotificationsByType(userId, type);
        return Result.success(notifications);
    }

    @GetMapping("/user/{userId}/unread-count")
    public Result<Long> getUnreadCount(@PathVariable Long userId) {
        long count = appService.getUnreadCount(userId);
        return Result.success(count);
    }

    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id) {
        appService.markAsRead(id);
        return Result.success();
    }

    @PutMapping("/{id}/unread")
    public Result<Void> markAsUnread(@PathVariable Long id) {
        appService.markAsUnread(id);
        return Result.success();
    }

    @PutMapping("/user/{userId}/read-all")
    public Result<Void> markAllAsRead(@PathVariable Long userId) {
        appService.markAllAsRead(userId);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteNotification(@PathVariable Long id) {
        appService.deleteNotification(id);
        return Result.success();
    }
}
