package com.graphhire.config;

import com.graphhire.auth.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.mock;

class SaTokenConfigTest {

    @Test
    void checkRoleForPath_shouldNotThrowOnNonGuardPath() {
        SaTokenConfig config = new SaTokenConfig();
        ReflectionTestUtils.setField(config, "userRepository", mock(UserRepository.class));
        assertDoesNotThrow(() -> ReflectionTestUtils.invokeMethod(config, "checkRoleForPath", "/public/jobs"));
    }
}

