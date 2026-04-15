package com.graphhire.web.controller;

import com.graphhire.web.dto.response.ApiResponse;
import com.graphhire.web.dto.response.PersonProfileResponse;
import com.graphhire.web.dto.response.ResumeDetailResponse;
import com.graphhire.web.dto.response.NotificationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/person")
public class PersonController {

    @Autowired
    private Object personService;

    @GetMapping("/profile")
    public ApiResponse<PersonProfileResponse> getProfile() {
        // TODO: Implement get profile logic
        return ApiResponse.success();
    }

    @PutMapping("/profile")
    public ApiResponse<Void> updateProfile(@RequestBody Object request) {
        // TODO: Implement update profile logic
        return ApiResponse.success();
    }

    @GetMapping("/resume/{id}/detail")
    public ApiResponse<ResumeDetailResponse> getResumeDetail(@PathVariable Long id) {
        // TODO: Implement get resume detail logic
        return ApiResponse.success();
    }

    @GetMapping("/resume/list")
    public ApiResponse<List<ResumeDetailResponse>> getResumeList() {
        // TODO: Implement get resume list logic
        return ApiResponse.success();
    }

    @GetMapping("/match/recommend")
    public ApiResponse<Object> recommendJobs(@RequestParam(required = false) Integer page,
                                              @RequestParam(required = false) Integer size) {
        // TODO: Implement recommend jobs logic
        return ApiResponse.success();
    }

    @GetMapping("/notification/list")
    public ApiResponse<List<NotificationResponse>> getNotificationList() {
        // TODO: Implement get notification list logic
        return ApiResponse.success();
    }

    @GetMapping("/notification/unread")
    public ApiResponse<List<NotificationResponse>> getUnreadNotifications() {
        // TODO: Implement get unread notifications logic
        return ApiResponse.success();
    }

    @GetMapping("/notification/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        // TODO: Implement get unread count logic
        return ApiResponse.success();
    }

    @PutMapping("/notification/{id}/read")
    public ApiResponse<Void> markNotificationRead(@PathVariable Long id) {
        // TODO: Implement mark notification read logic
        return ApiResponse.success();
    }
}
