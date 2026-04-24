package com.graphhire.notification.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationAppServiceTest {

    @Mock
    private NotificationRepository repository;

    @InjectMocks
    private NotificationAppService service;

    @Test
    void getNotification_WhenCrossUser_ShouldThrowForbidden() {
        Notification n = new Notification();
        n.setId(1L);
        n.setUserId(100L);
        when(repository.findById(1L)).thenReturn(Optional.of(n));

        assertThrows(Exceptions.ForbiddenException.class, () -> service.getNotification(1L, 200L));
    }
}
