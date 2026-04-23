package com.graphhire.admin.domain.service;

import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.UserType;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

class AdminDomainServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final AdminDomainService service = new AdminDomainService(userRepository);

    @Test
    void hasAdminPrivileges_WhenAdmin_ReturnsTrue() {
        User admin = new User();
        admin.setUserType(UserType.ADMIN);
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        assertTrue(service.hasAdminPrivileges(1L));
    }

    @Test
    void hasAdminPrivileges_WhenNonAdmin_ReturnsFalse() {
        User user = new User();
        user.setUserType(UserType.PERSON);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        assertFalse(service.hasAdminPrivileges(2L));
    }
}

