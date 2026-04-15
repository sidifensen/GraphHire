package com.graphhire.auth.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.auth.domain.vo.*;
import com.graphhire.auth.domain.event.UserLoginEvent;
import com.graphhire.auth.domain.event.UserLockedEvent;
import com.graphhire.auth.domain.event.UserRegisteredEvent;

import java.time.LocalDateTime;

public class User extends BaseAggregateRoot {
    private Long id;
    private Username username;
    private EncryptedPassword password;
    private UserType userType;
    private AuthStatus status;
    private Integer failedLoginCount = 0;
    private LocalDateTime lockedUntil;

    public void loginSuccess() {
        this.failedLoginCount = 0;
        this.lockedUntil = null;
        this.registerEvent(new UserLoginEvent(this));
    }

    public void loginFailed() {
        this.failedLoginCount++;
        if (this.failedLoginCount >= 5) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(15);
            this.registerEvent(new UserLockedEvent(this));
        }
    }

    public boolean isLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }

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
}