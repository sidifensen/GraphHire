package com.graphhire.auth.domain.repository;

import com.graphhire.auth.domain.model.User;

import java.util.Optional;

public interface UserRepository {
    Optional<User> findById(Long id);
    Optional<User> findByUsername(String username);
    User save(User user);
    void delete(User user);
}