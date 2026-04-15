package com.graphhire.notification.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.notification.infrastructure.persistence.mapper.NotificationMapper;
import com.graphhire.notification.infrastructure.persistence.po.NotificationPO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = NotificationRepositoryImpl.class)
class NotificationRepositoryImplTest {

    @MockBean
    private NotificationMapper notificationMapper;

    @Autowired
    private NotificationRepositoryImpl notificationRepository;

    private NotificationPO samplePO;
    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        samplePO = new NotificationPO();
        samplePO.setId(1L);
        samplePO.setUserId(100L);
        samplePO.setType(1);
        samplePO.setTitle("Test Title");
        samplePO.setContent("Test Content");
        samplePO.setReferenceId(200L);
        samplePO.setIsRead(false);
        samplePO.setCreatedAt(LocalDateTime.of(2026, 4, 15, 10, 0, 0));
        samplePO.setUpdatedAt(LocalDateTime.of(2026, 4, 15, 10, 0, 0));

        sampleNotification = new Notification();
        sampleNotification.setId(1L);
        sampleNotification.setUserId(100L);
        sampleNotification.setType(NotificationType.RESUME_PARSED);
        sampleNotification.setTitle("Test Title");
        sampleNotification.setContent("Test Content");
        sampleNotification.setReferenceId(200L);
        sampleNotification.setIsRead(false);
        sampleNotification.setCreatedAt(LocalDateTime.of(2026, 4, 15, 10, 0, 0));
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("should return notification when found")
        void findById_Found() {
            when(notificationMapper.selectById(1L)).thenReturn(samplePO);

            Optional<Notification> result = notificationRepository.findById(1L);

            assertTrue(result.isPresent());
            assertEquals(1L, result.get().getId());
            assertEquals(100L, result.get().getUserId());
            assertEquals(NotificationType.RESUME_PARSED, result.get().getType());
            verify(notificationMapper).selectById(1L);
        }

        @Test
        @DisplayName("should return empty when not found")
        void findById_NotFound() {
            when(notificationMapper.selectById(999L)).thenReturn(null);

            Optional<Notification> result = notificationRepository.findById(999L);

            assertFalse(result.isPresent());
            verify(notificationMapper).selectById(999L);
        }
    }

    @Nested
    @DisplayName("findByUserId")
    class FindByUserIdTests {

        @Test
        @DisplayName("should return notifications for user ordered by createdAt desc")
        void findByUserId_Success() {
            NotificationPO po2 = new NotificationPO();
            po2.setId(2L);
            po2.setUserId(100L);
            po2.setType(2);
            po2.setTitle("Title 2");
            po2.setContent("Content 2");
            po2.setIsRead(true);
            po2.setCreatedAt(LocalDateTime.of(2026, 4, 14, 10, 0, 0));

            when(notificationMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(Arrays.asList(samplePO, po2));

            List<Notification> result = notificationRepository.findByUserId(100L);

            assertEquals(2, result.size());
            assertEquals(1L, result.get(0).getId());
            assertEquals(2L, result.get(1).getId());
            verify(notificationMapper).selectList(any(LambdaQueryWrapper.class));
        }

        @Test
        @DisplayName("should return empty list when no notifications")
        void findByUserId_Empty() {
            when(notificationMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(List.of());

            List<Notification> result = notificationRepository.findByUserId(100L);

            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("findByUserIdAndIsRead")
    class FindByUserIdAndIsReadTests {

        @Test
        @DisplayName("should return unread notifications for user")
        void findByUserIdAndIsRead_Unread() {
            when(notificationMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(List.of(samplePO));

            List<Notification> result = notificationRepository.findByUserIdAndIsRead(100L, false);

            assertEquals(1, result.size());
            assertFalse(result.get(0).getIsRead());
        }

        @Test
        @DisplayName("should return read notifications for user")
        void findByUserIdAndIsRead_Read() {
            samplePO.setIsRead(true);
            when(notificationMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(List.of(samplePO));

            List<Notification> result = notificationRepository.findByUserIdAndIsRead(100L, true);

            assertEquals(1, result.size());
            assertTrue(result.get(0).getIsRead());
        }
    }

    @Nested
    @DisplayName("findByUserIdAndType")
    class FindByUserIdAndTypeTests {

        @Test
        @DisplayName("should return notifications by type")
        void findByUserIdAndType_Success() {
            when(notificationMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(List.of(samplePO));

            List<Notification> result = notificationRepository.findByUserIdAndType(100L, NotificationType.RESUME_PARSED);

            assertEquals(1, result.size());
            assertEquals(NotificationType.RESUME_PARSED, result.get(0).getType());
        }
    }

    @Nested
    @DisplayName("findUnreadByUserId")
    class FindUnreadByUserIdTests {

        @Test
        @DisplayName("should return unread notifications")
        void findUnreadByUserId_Success() {
            when(notificationMapper.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(List.of(samplePO));

            List<Notification> result = notificationRepository.findUnreadByUserId(100L);

            assertEquals(1, result.size());
            assertFalse(result.get(0).getIsRead());
        }
    }

    @Nested
    @DisplayName("save")
    class SaveTests {

        @Test
        @DisplayName("should insert new notification when id is null")
        void save_Insert() {
            Notification newNotification = new Notification();
            newNotification.setUserId(100L);
            newNotification.setType(NotificationType.JOB_RECOMMENDATION);
            newNotification.setTitle("New Title");
            newNotification.setContent("New Content");
            newNotification.setReferenceId(300L);
            newNotification.setIsRead(false);

            when(notificationMapper.insert(any(NotificationPO.class))).thenReturn(1);
            when(notificationMapper.selectById(1L)).thenReturn(samplePO);

            Notification result = notificationRepository.save(newNotification);

            assertNotNull(result);
            assertEquals(1L, result.getId());
            verify(notificationMapper).insert(any(NotificationPO.class));
        }

        @Test
        @DisplayName("should update existing notification when id is not null")
        void save_Update() {
            when(notificationMapper.updateById(any(NotificationPO.class))).thenReturn(1);

            Notification result = notificationRepository.save(sampleNotification);

            assertNotNull(result);
            verify(notificationMapper).updateById(any(NotificationPO.class));
        }
    }

    @Nested
    @DisplayName("delete")
    class DeleteTests {

        @Test
        @DisplayName("should delete notification when id is not null")
        void delete_Success() {
            when(notificationMapper.deleteById(1L)).thenReturn(1);

            notificationRepository.delete(sampleNotification);

            verify(notificationMapper).deleteById(1L);
        }

        @Test
        @DisplayName("should not delete when id is null")
        void delete_NullId() {
            sampleNotification.setId(null);

            notificationRepository.delete(sampleNotification);

            verify(notificationMapper, never()).deleteById(any(Long.class));
        }
    }

    @Nested
    @DisplayName("countUnreadByUserId")
    class CountUnreadByUserIdTests {

        @Test
        @DisplayName("should return count of unread notifications")
        void countUnread_Success() {
            when(notificationMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(5L);

            long result = notificationRepository.countUnreadByUserId(100L);

            assertEquals(5L, result);
        }

        @Test
        @DisplayName("should return zero when no unread notifications")
        void countUnread_Zero() {
            when(notificationMapper.selectCount(any(LambdaQueryWrapper.class))).thenReturn(0L);

            long result = notificationRepository.countUnreadByUserId(100L);

            assertEquals(0L, result);
        }
    }

    @Nested
    @DisplayName("markAllAsReadByUserId")
    class MarkAllAsReadByUserIdTests {

        @Test
        @DisplayName("should mark all notifications as read for user")
        void markAllAsRead_Success() {
            when(notificationMapper.update(any(NotificationPO.class), any(LambdaQueryWrapper.class)))
                .thenReturn(2);

            notificationRepository.markAllAsReadByUserId(100L);

            verify(notificationMapper).update(any(NotificationPO.class), any(LambdaQueryWrapper.class));
        }
    }
}