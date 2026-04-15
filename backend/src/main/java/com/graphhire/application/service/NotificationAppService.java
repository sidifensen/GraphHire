package com.graphhire.application.service;

import com.graphhire.application.dto.NotificationResponse;
import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.Notification;
import com.graphhire.domain.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationAppService {
    private final NotificationRepository notificationRepository;

    public PageResult<NotificationResponse> list(Long userId, Integer page, Integer pageSize) {
        log.info("Listing notifications for userId: {}, page: {}, pageSize: {}", userId, page, pageSize);

        List<Notification> notifications = notificationRepository.findByUserId(userId, page, pageSize);
        Long total = (long) notificationRepository.countUnread(userId);

        List<NotificationResponse> responses = notifications.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) total / pageSize);

        return PageResult.<NotificationResponse>builder()
                .records(responses)
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .build();
    }

    public List<NotificationResponse> listUnread(Long userId) {
        log.info("Listing unread notifications for userId: {}", userId);

        List<Notification> notifications = notificationRepository.findUnreadByUserId(userId);

        return notifications.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        log.info("Marking notification as read: notificationId={}", notificationId);

        Notification notification = notificationRepository.findByIdOptional(notificationId)
                .orElseThrow(() -> new RuntimeException("通知不存在"));

        notification.setIsRead(true);
        notificationRepository.save(notification);

        log.info("Notification marked as read");
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for userId: {}", userId);

        List<Notification> notifications = notificationRepository.findUnreadByUserId(userId);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }

        log.info("All notifications marked as read: count={}", notifications.size());
    }

    public int countUnread(Long userId) {
        log.info("Counting unread notifications for userId: {}", userId);
        return notificationRepository.countUnread(userId);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .content(notification.getContent())
                .isRead(notification.getIsRead())
                .referenceId(notification.getReferenceId())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
