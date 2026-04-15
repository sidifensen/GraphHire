package com.graphhire.auth.infrastructure.persistence.repository;

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
        UserPO po = new UserPO();
        po.setUsername(username);
        return Optional.ofNullable(userMapper.selectOne(null)).map(this::toDomain);
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
        user.setPassword(new EncryptedPassword(po.getPassword()));
        user.setUserType(po.getUserType());
        user.setStatus(po.getStatus());
        user.setFailedLoginCount(po.getFailedLoginCount());
        user.setLockedUntil(po.getLockedUntil());
        return user;
    }

    private UserPO toPO(User user) {
        UserPO po = new UserPO();
        po.setId(user.getId());
        po.setUsername(user.getUsername().getValue());
        po.setPassword(user.getPassword().getValue());
        po.setUserType(user.getUserType());
        po.setStatus(user.getStatus());
        po.setFailedLoginCount(user.getFailedLoginCount());
        po.setLockedUntil(user.getLockedUntil());
        return po;
    }
}