package com.graphhire.auth.domain.event;

import com.graphhire.auth.domain.model.User;
import com.graphhire.common.model.BaseAggregateRoot.DomainEvent;

/**
 * 用户注册领域事件
 * 用户成功注册后发布，携带注册用户信息
 */
public class UserRegisteredEvent extends DomainEvent {
    /** 注册的用户实体 */
    private final User user;

    public UserRegisteredEvent(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }
}