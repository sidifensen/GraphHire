package com.graphhire.domain.model;

import com.graphhire.domain.vo.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification implements Serializable {
    private Long id;
    private Long userId;
    private NotificationType type;
    private String title;
    private String content;
    private Boolean isRead;
    private Long referenceId;
    private LocalDateTime createdAt;
}
