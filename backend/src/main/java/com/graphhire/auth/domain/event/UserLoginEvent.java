package com.graphhire.auth.domain.event;

import com.graphhire.auth.domain.model.User;
import com.graphhire.common.model.BaseAggregateRoot.DomainEvent;

/**
 * 用户登录领域事件
 * 用户成功登录后发布，携带登录用户信息
 */
public class UserLoginEvent extends DomainEvent {
    /** 登录的用户实体 */
    private final User user;

    public UserLoginEvent(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }
}