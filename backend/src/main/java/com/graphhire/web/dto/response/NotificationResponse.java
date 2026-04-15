package com.graphhire.web.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private Integer type;
    private String title;
    private String content;
    private Boolean isRead;
    private Long referenceId;
    private LocalDateTime createdAt;
}
