package com.graphhire.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.domain.model.User;
import com.graphhire.domain.repository.UserRepository;
import com.graphhire.domain.vo.UserType;
import com.graphhire.infrastructure.persistence.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {
    private final UserMapper userMapper;

    @Override
    public User findById(Long id) {
        return userMapper.selectById(id);
    }

    @Override
    public Optional<User> findByIdOptional(Long id) {
        return Optional.ofNullable(findById(id));
    }

    @Override
    public User findByUsername(String username) {
        return userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
    }

    @Override
    public Optional<User> findByUsernameOptional(String username) {
        return Optional.ofNullable(findByUsername(username));
    }

    @Override
    public User findByEmail(String email) {
        return userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getEmail, email));
    }

    @Override
    public Optional<User> findByEmailOptional(String email) {
        return Optional.ofNullable(findByEmail(email));
    }

    @Override
    public boolean existsByUsername(String username) {
        return findByUsername(username) != null;
    }

    @Override
    public boolean existsByEmail(String email) {
        return findByEmail(email) != null;
    }

    @Override
    public User save(User user) {
        if (user.getId() == null) {
            userMapper.insert(user);
        } else {
            userMapper.updateById(user);
        }
        return user;
    }

    @Override
    public void update(User user) {
        userMapper.updateById(user);
    }

    @Override
    public void updateLoginInfo(Long userId, LocalDateTime loginTime, String ip) {
        User user = new User();
        user.setId(userId);
        user.setLastLoginTime(loginTime);
        user.setLastLoginIp(ip);
        userMapper.updateById(user);
    }

    @Override
    public void incrementFailedAttempts(Long userId) {
        User user = findById(userId);
        user.setFailedAttempts(user.getFailedAttempts() + 1);
        userMapper.updateById(user);
    }

    @Override
    public void resetFailedAttempts(Long userId) {
        User user = new User();
        user.setId(userId);
        user.setFailedAttempts(0);
        userMapper.updateById(user);
    }

    @Override
    public void lockAccount(Long userId, LocalDateTime until) {
        User user = new User();
        user.setId(userId);
        user.setLockUntil(until);
        userMapper.updateById(user);
    }

    @Override
    public List<User> findByKeyword(String keyword, UserType userType, Integer page, Integer pageSize) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(User::getUsername, keyword).or().like(User::getEmail, keyword);
        }
        if (userType != null) {
            wrapper.eq(User::getUserType, userType);
        }
        wrapper.orderByDesc(User::getCreatedAt);
        int offset = (page - 1) * pageSize;
        wrapper.last("LIMIT " + offset + ", " + pageSize);
        return userMapper.selectList(wrapper);
    }

    @Override
    public Long countByKeyword(String keyword, UserType userType) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(User::getUsername, keyword).or().like(User::getEmail, keyword);
        }
        if (userType != null) {
            wrapper.eq(User::getUserType, userType);
        }
        return userMapper.selectCount(wrapper);
    }

    @Override
    public Long countAll() {
        return userMapper.selectCount(null);
    }

    @Override
    public Long countByUserType(UserType userType) {
        return userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getUserType, userType));
    }

    @Override
    public List<User> findByUserType(UserType userType, Integer page, Integer pageSize) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUserType, userType);
        wrapper.orderByDesc(User::getCreatedAt);
        int offset = (page - 1) * pageSize;
        wrapper.last("LIMIT " + offset + ", " + pageSize);
        return userMapper.selectList(wrapper);
    }
}
