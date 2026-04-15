package com.graphhire.auth.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.*;
import com.graphhire.auth.infrastructure.persistence.mapper.UserMapper;
import com.graphhire.auth.infrastructure.persistence.po.UserPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepositoryImpl implements UserRepository {
    @Autowired
    private UserMapper userMapper;

    @Override
    public Optional<User> findById(Long id) {
        UserPO po = userMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        UserPO po = userMapper.selectOne(new LambdaQueryWrapper<UserPO>().eq(UserPO::getUsername, username));
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public User save(User user) {
        UserPO po = toPO(user);
        if (user.getId() == null) {
            userMapper.insert(po);
            user.setId(po.getId());
        } else {
            userMapper.updateById(po);
        }
        return user;
    }

    @Override
    public void delete(User user) {
        userMapper.deleteById(user.getId());
    }

    private User toDomain(UserPO po) {
        if (po == null) return null;
        User user = new User();
        user.setId(po.getId());
        user.setUsername(Username.of(po.getUsername()));
        user.setPassword(EncryptedPassword.encode(po.getPassword()));
        user.setUserType(mapIntToUserType(po.getUserType()));
        user.setStatus(mapIntToAuthStatus(po.getStatus()));
        user.setFailedLoginCount(po.getFailedAttempts());
        user.setLockedUntil(po.getLockUntil());
        return user;
    }

    private UserPO toPO(User user) {
        UserPO po = new UserPO();
        po.setId(user.getId());
        po.setUsername(user.getUsername().getValue());
        po.setPassword(user.getPassword().getValue());
        po.setUserType(mapUserTypeToInt(user.getUserType()));
        po.setStatus(mapAuthStatusToInt(user.getStatus()));
        po.setFailedAttempts(user.getFailedLoginCount());
        po.setLockUntil(user.getLockedUntil());
        return po;
    }

    private UserType mapIntToUserType(Integer value) {
        if (value == null) return null;
        switch (value) {
            case 1: return UserType.PERSON;
            case 2: return UserType.COMPANY;
            case 3: return UserType.ADMIN;
            default: return UserType.PERSON;
        }
    }

    private Integer mapUserTypeToInt(UserType userType) {
        if (userType == null) return null;
        switch (userType) {
            case PERSON: return 1;
            case COMPANY: return 2;
            case ADMIN: return 3;
            default: return 1;
        }
    }

    private AuthStatus mapIntToAuthStatus(Integer value) {
        if (value == null) return AuthStatus.PENDING_VERIFY;
        switch (value) {
            case 0: return AuthStatus.DISABLED;
            case 1: return AuthStatus.VERIFIED;
            default: return AuthStatus.VERIFIED;
        }
    }

    private Integer mapAuthStatusToInt(AuthStatus status) {
        if (status == null) return 1;
        switch (status) {
            case DISABLED: return 0;
            case VERIFIED: return 1;
            case PENDING_VERIFY: return 1;
            case LOCKED: return 1;
            default: return 1;
        }
    }
}