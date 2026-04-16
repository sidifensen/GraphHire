package com.graphhire.auth.domain.event;

import com.graphhire.auth.domain.model.User;
import com.graphhire.common.model.BaseAggregateRoot.DomainEvent;

/**
 * 用户锁定领域事件
 * 用户连续登录失败达到5次后发布，携带被锁定用户信息
 */
public class UserLockedEvent extends DomainEvent {
    /** 被锁定的用户实体 */
    private final User user;

    public UserLockedEvent(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }
}