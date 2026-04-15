package com.graphhire.application.service;

import com.graphhire.application.dto.PageResult;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.repository.PersonRepository;
import com.graphhire.domain.repository.UserRepository;
import com.graphhire.domain.vo.UserType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserAppServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PersonRepository personRepository;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private UserAppService userAppService;

    @Nested
    @DisplayName("根据ID获取用户测试")
    class GetUserByIdTests {

        @Test
        @DisplayName("成功根据ID获取用户")
        void getUserById_Success() {
            // Given
            Long id = 1L;
            User user = User.builder()
                    .id(id)
                    .username("testuser")
                    .email("test@example.com")
                    .build();

            when(userRepository.findByIdOptional(id)).thenReturn(Optional.of(user));

            // When
            User result = userAppService.getUserById(id);

            // Then
            assertNotNull(result);
            assertEquals(id, result.getId());
            assertEquals("testuser", result.getUsername());
        }

        @Test
        @DisplayName("用户不存在时抛出异常")
        void getUserById_NotFound_ThrowsException() {
            // Given
            Long id = 999L;
            when(userRepository.findByIdOptional(id)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> userAppService.getUserById(id));
            assertEquals("用户不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("根据用户名获取用户测试")
    class GetUserByUsernameTests {

        @Test
        @DisplayName("成功根据用户名获取用户")
        void getUserByUsername_Success() {
            // Given
            String username = "testuser";
            User user = User.builder()
                    .id(1L)
                    .username(username)
                    .build();

            when(userRepository.findByUsernameOptional(username)).thenReturn(Optional.of(user));

            // When
            User result = userAppService.getUserByUsername(username);

            // Then
            assertNotNull(result);
            assertEquals(username, result.getUsername());
        }

        @Test
        @DisplayName("用户名不存在时抛出异常")
        void getUserByUsername_NotFound_ThrowsException() {
            // Given
            String username = "nonexistent";
            when(userRepository.findByUsernameOptional(username)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> userAppService.getUserByUsername(username));
            assertEquals("用户不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("更新用户状态测试")
    class UpdateUserStatusTests {

        @Test
        @DisplayName("成功更新用户状态")
        void updateUserStatus_Success() {
            // Given
            Long userId = 1L;
            Integer status = 0; // Disabled
            User user = User.builder()
                    .id(userId)
                    .username("testuser")
                    .status(1)
                    .build();

            when(userRepository.findByIdOptional(userId)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenReturn(user);

            // When
            userAppService.updateUserStatus(userId, status);

            // Then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals(0, userCaptor.getValue().getStatus());
        }

        @Test
        @DisplayName("用户不存在时更新失败")
        void updateUserStatus_NotFound_ThrowsException() {
            // Given
            Long userId = 999L;
            when(userRepository.findByIdOptional(userId)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> userAppService.updateUserStatus(userId, 0));
            assertEquals("用户不存在", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("用户列表测试")
    class ListUsersTests {

        @Test
        @DisplayName("分页查询用户列表成功")
        void listUsers_Success() {
            // Given
            UserType userType = UserType.PERSON;
            Integer page = 1;
            Integer pageSize = 10;
            List<User> users = Arrays.asList(
                    User.builder().id(1L).username("user1").userType(userType).build(),
                    User.builder().id(2L).username("user2").userType(userType).build()
            );

            when(userRepository.findByUserType(userType, page, pageSize)).thenReturn(users);
            when(userRepository.countByUserType(userType)).thenReturn(2L);

            // When
            PageResult<User> result = userAppService.listUsers(userType, page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(2, result.getRecords().size());
            assertEquals(2L, result.getTotal());
            assertEquals(1, result.getPage());
            assertEquals(10, result.getPageSize());
            assertEquals(1, result.getTotalPages());
        }

        @Test
        @DisplayName("查询所有类型用户成功")
        void listUsers_NullUserType_Success() {
            // Given
            Integer page = 1;
            Integer pageSize = 10;
            List<User> users = Arrays.asList(
                    User.builder().id(1L).username("user1").build(),
                    User.builder().id(2L).username("user2").build()
            );

            when(userRepository.findByUserType(null, page, pageSize)).thenReturn(users);
            when(userRepository.countByUserType(null)).thenReturn(2L);

            // When
            PageResult<User> result = userAppService.listUsers(null, page, pageSize);

            // Then
            assertNotNull(result);
            assertEquals(2, result.getRecords().size());
        }
    }
}
