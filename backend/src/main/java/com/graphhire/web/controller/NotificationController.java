package com.graphhire.web.controller;

import com.graphhire.web.dto.response.ApiResponse;
import com.graphhire.web.dto.response.NotificationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notification")
public class NotificationController {

    @Autowired
    private Object notificationService;

    @GetMapping("/list")
    public ApiResponse<List<NotificationResponse>> getNotificationList() {
        // TODO: Implement get notification list logic
        return ApiResponse.success();
    }

    @GetMapping("/unread")
    public ApiResponse<List<NotificationResponse>> getUnreadNotifications() {
        // TODO: Implement get unread notifications logic
        return ApiResponse.success();
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        // TODO: Implement get unread count logic
        return ApiResponse.success();
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Void> markNotificationRead(@PathVariable Long id) {
        // TODO: Implement mark notification read logic
        return ApiResponse.success();
    }

    @PutMapping("/read-all")
    public ApiResponse<Void> markAllNotificationsRead() {
        // TODO: Implement mark all notifications read logic
        return ApiResponse.success();
    }
}
