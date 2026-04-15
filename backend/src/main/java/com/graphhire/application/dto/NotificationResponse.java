package com.graphhire.application.dto;

import com.graphhire.domain.vo.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String title;
    private String content;
    private Boolean isRead;
    private Long referenceId;
    private LocalDateTime createdAt;
}
