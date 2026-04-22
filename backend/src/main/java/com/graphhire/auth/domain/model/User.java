package com.graphhire.auth.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.auth.domain.vo.*;
import com.graphhire.auth.domain.event.UserLoginEvent;
import com.graphhire.auth.domain.event.UserLockedEvent;
import com.graphhire.auth.domain.event.UserRegisteredEvent;

import java.time.LocalDateTime;

/**
 * 用户领域模型
 *
 * 【模块说明】管理用户认证实体的完整生命周期，包含登录、注册、锁定等核心业务行为。
 *
 * 【状态机】
 * - PENDING_VERIFY：待验证（注册后默认状态）
 * - VERIFIED：已验证
 * - REJECTED：已拒绝
 * - LOCKED：已锁定（连续登录失败触发）
 * - DISABLED：已禁用
 *
 * 【事件发布】
 * - register()：发布 UserRegisteredEvent
 * - loginSuccess()：发布 UserLoginEvent
 * - loginFailed()：连续失败5次后发布 UserLockedEvent
 *
 * 【业务规则】
 * - 连续登录失败5次后账号锁定15分钟
 * - 用户名格式必须为邮箱格式（由 Username 值对象保证）
 * - 密码使用 BCrypt 加密存储（由 EncryptedPassword 值对象保证）
 */
public class User extends BaseAggregateRoot {
    /** 用户唯一标识 */
    private Long id;
    /** 用户名（邮箱格式） */
    private Username username;
    /** BCrypt 加密后的密码 */
    private EncryptedPassword password;
    /** 用户类型：PERSON / COMPANY / ADMIN */
    private UserType userType;
    /** 账号状态 */
    private AuthStatus status;
    /** 连续登录失败次数 */
    private Integer failedLoginCount = 0;
    /** 账号锁定截止时间 */
    private LocalDateTime lockedUntil;
    /** 创建时间 */
    private LocalDateTime createTime;
    /** 最后登录时间 */
    private LocalDateTime lastLoginTime;

    /**
     * 登录成功处理
     * 重置失败计数、清除锁定状态、发布登录事件
     */
    public void loginSuccess() {
        this.failedLoginCount = 0;
        this.lockedUntil = null;
        this.registerEvent(new UserLoginEvent(this));
    }

    /**
     * 登录失败处理
     * 递增失败计数，达到5次时锁定账号15分钟并发布锁定事件
     */
    public void loginFailed() {
        this.failedLoginCount++;
        if (this.failedLoginCount >= 5) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(15);
            this.registerEvent(new UserLockedEvent(this));
        }
    }

    /**
     * 检查账号是否处于锁定状态
     * @return true 表示已锁定，false 表示未锁定
     */
    public boolean isLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }

    /**
     * 用户注册
     * 加密密码、设置待验证状态、发布注册事件
     * @param rawPassword 明文密码（会被 BCrypt 加密）
     */
    public void register(String rawPassword) {
        this.password = EncryptedPassword.encode(rawPassword);
        this.status = AuthStatus.PENDING_VERIFY;
        this.registerEvent(new UserRegisteredEvent(this));
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Username getUsername() {
        return username;
    }

    public void setUsername(Username username) {
        this.username = username;
    }

    public EncryptedPassword getPassword() {
        return password;
    }

    public void setPassword(EncryptedPassword password) {
        this.password = password;
    }

    public UserType getUserType() {
        return userType;
    }

    public void setUserType(UserType userType) {
        this.userType = userType;
    }

    public AuthStatus getStatus() {
        return status;
    }

    public void setStatus(AuthStatus status) {
        this.status = status;
    }

    public Integer getFailedLoginCount() {
        return failedLoginCount;
    }

    public void setFailedLoginCount(Integer failedLoginCount) {
        this.failedLoginCount = failedLoginCount;
    }

    public LocalDateTime getLockedUntil() {
        return lockedUntil;
    }

    public void setLockedUntil(LocalDateTime lockedUntil) {
        this.lockedUntil = lockedUntil;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getLastLoginTime() {
        return lastLoginTime;
    }

    public void setLastLoginTime(LocalDateTime lastLoginTime) {
        this.lastLoginTime = lastLoginTime;
    }
}