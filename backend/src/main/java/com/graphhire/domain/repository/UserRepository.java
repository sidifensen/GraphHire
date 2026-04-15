package com.graphhire.domain.repository;

import com.graphhire.domain.model.User;
import com.graphhire.domain.vo.UserType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository {
    User findById(Long id);
    Optional<User> findByIdOptional(Long id);
    User findByUsername(String username);
    Optional<User> findByUsernameOptional(String username);
    User findByEmail(String email);
    Optional<User> findByEmailOptional(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    User save(User user);
    void update(User user);
    void updateLoginInfo(Long userId, LocalDateTime loginTime, String ip);
    void incrementFailedAttempts(Long userId);
    void resetFailedAttempts(Long userId);
    void lockAccount(Long userId, LocalDateTime until);
    List<User> findByKeyword(String keyword, UserType userType, Integer page, Integer pageSize);
    Long countByKeyword(String keyword, UserType userType);
    Long countAll();
    Long countByUserType(UserType userType);
    List<User> findByUserType(UserType userType, Integer page, Integer pageSize);
}
