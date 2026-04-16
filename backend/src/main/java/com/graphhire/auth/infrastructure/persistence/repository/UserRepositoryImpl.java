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

/**
 * 用户仓储实现
 *
 * 【模块说明】实现 UserRepository 接口，负责用户数据与数据库之间的持久化转换。
 *
 * 【数据来源】
 * - 数据表：sys_user
 * - 使用 MyBatis-Plus 进行数据库操作
 *
 * 【方法概览】
 * - findById()：根据ID查询用户
 * - findByUsername()：根据用户名查询用户
 * - save()：保存用户（新增或更新）
 * - delete()：删除用户
 *
 * 【DO-DTO 转换】
 * - toDomain()：UserPO -> User 领域实体
 * - toPO()：User 领域实体 -> UserPO
 */
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

    /**
     * 将 UserPO 转换为领域实体 User
     * @param po 数据库持久化对象
     * @return 用户领域实体，po 为 null 时返回 null
     */
    private User toDomain(UserPO po) {
        if (po == null) return null;
        User user = new User();
        user.setId(po.getId());
        user.setUsername(Username.of(po.getUsername()));
        user.setPassword(EncryptedPassword.fromEncrypted(po.getPassword()));
        user.setUserType(mapIntToUserType(po.getUserType()));
        user.setStatus(mapIntToAuthStatus(po.getStatus()));
        // 注意：failedLoginCount 和 lockedUntil 不持久化到 sys_user 表
        return user;
    }

    /**
     * 将领域实体 User 转换为 UserPO
     * @param user 用户领域实体
     * @return 数据库持久化对象
     */
    private UserPO toPO(User user) {
        UserPO po = new UserPO();
        po.setId(user.getId());
        po.setUsername(user.getUsername().getValue());
        po.setPassword(user.getPassword().getValue());
        po.setUserType(mapUserTypeToInt(user.getUserType()));
        po.setStatus(mapAuthStatusToInt(user.getStatus()));
        // 注意：failedLoginCount 和 lockedUntil 不持久化到 sys_user 表
        return po;
    }

    /** 将整数映射为 UserType 枚举 */
    private UserType mapIntToUserType(Integer value) {
        if (value == null) return null;
        switch (value) {
            case 1: return UserType.PERSON;
            case 2: return UserType.COMPANY;
            case 3: return UserType.ADMIN;
            default: return UserType.PERSON;
        }
    }

    /** 将 UserType 枚举映射为整数 */
    private Integer mapUserTypeToInt(UserType userType) {
        if (userType == null) return null;
        switch (userType) {
            case PERSON: return 1;
            case COMPANY: return 2;
            case ADMIN: return 3;
            default: return 1;
        }
    }

    /** 将整数映射为 AuthStatus 枚举 */
    private AuthStatus mapIntToAuthStatus(Integer value) {
        if (value == null) return AuthStatus.PENDING_VERIFY;
        switch (value) {
            case 0: return AuthStatus.DISABLED;
            case 1: return AuthStatus.VERIFIED;
            default: return AuthStatus.VERIFIED;
        }
    }

    /** 将 AuthStatus 枚举映射为整数 */
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