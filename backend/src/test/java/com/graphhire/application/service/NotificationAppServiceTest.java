package com.graphhire.application.service;

import com.graphhire.application.dto.NotificationResponse;
import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.Notification;
import com.graphhire.domain.repository.NotificationRepository;
import com.graphhire.domain.vo.NotificationType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationAppServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationAppService notificationAppService;

    @Nested
    @DisplayName("通知列表测试")
    class ListTests {

        @Test
        @DisplayName("分页查询通知列表成功")
        void list_Success() {
            // Given
            Long userId = 1L;
            Integer page = 1;
            Integer pageSize = 10;
            List<Notification> notifications = Arrays.asList(
                    Notification.builder()
                            .id(1L)
                            .userId(userId)
                            .type(NotificationType.RESUME_PARSED)
                            .title("新匹配通知")
                            .content("有新的职位匹配")
                            .isRead(false)
                            .createdAt(LocalDateTime.now())
                            .build(),
                    Notification.builder()
                            .id(2L)
                            .userId(userId)
                            .type(NotificationType.JOB_RECOMMENDED)
                            .title("系统消息")
                            .content("系统升级通知")
                            .isRead(true)
                            .createdAt(LocalDateTime.now())
                            .build()
            );

            when(notificationRepository.findByUserId(userId, page, pageSize)).thenReturn(notifications);
            when(notificationRepository.countUnread(userId)).thenReturn(1);

            // When
            PageResult<NotificationResponse> result = notificationAppService.list(userId, page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(2, result.getRecords().size());
            assertEquals(1L, result.getTotal());
        }

        @Test
        @DisplayName("成功获取未读通知列表")
        void listUnread_Success() {
            // Given
            Long userId = 1L;
            List<Notification> notifications = Arrays.asList(
                    Notification.builder()
                            .id(1L)
                            .userId(userId)
                            .type(NotificationType.RESUME_PARSED)
                            .title("新匹配通知")
                            .isRead(false)
                            .createdAt(LocalDateTime.now())
                            .build()
            );

            when(notificationRepository.findUnreadByUserId(userId)).thenReturn(notifications);

            // When
            List<NotificationResponse> result = notificationAppService.listUnread(userId);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("新匹配通知", result.get(0).getTitle());
        }
    }

    @Nested
    @DisplayName("标记已读测试")
    class MarkAsReadTests {

        @Test
        @DisplayName("成功标记单条通知为已读")
        void markAsRead_Success() {
            // Given
            Long notificationId = 1L;
            Notification notification = Notification.builder()
                    .id(notificationId)
                    .isRead(false)
                    .build();

            when(notificationRepository.findByIdOptional(notificationId)).thenReturn(Optional.of(notification));
            when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

            // When
            notificationAppService.markAsRead(notificationId);

            // Then
            ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(notificationCaptor.capture());
            assertTrue(notificationCaptor.getValue().getIsRead());
        }

        @Test
        @DisplayName("通知不存在时标记失败")
        void markAsRead_NotFound_ThrowsException() {
            // Given
            Long notificationId = 999L;
            when(notificationRepository.findByIdOptional(notificationId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> notificationAppService.markAsRead(notificationId));
            assertEquals("通知不存在", exception.getMessage());
        }

        @Test
        @DisplayName("成功标记所有通知为已读")
        void markAllAsRead_Success() {
            // Given
            Long userId = 1L;
            List<Notification> notifications = Arrays.asList(
                    Notification.builder().id(1L).isRead(false).build(),
                    Notification.builder().id(2L).isRead(false).build()
            );

            when(notificationRepository.findUnreadByUserId(userId)).thenReturn(notifications);
            when(notificationRepository.save(any(Notification.class))).thenReturn(null);

            // When
            notificationAppService.markAllAsRead(userId);

            // Then
            verify(notificationRepository, times(2)).save(any(Notification.class));
        }
    }

    @Nested
    @DisplayName("未读数量测试")
    class CountUnreadTests {

        @Test
        @DisplayName("成功获取未读通知数量")
        void countUnread_Success() {
            // Given
            Long userId = 1L;
            when(notificationRepository.countUnread(userId)).thenReturn(5);

            // When
            int count = notificationAppService.countUnread(userId);

            // Then
            assertEquals(5, count);
        }
    }
}
