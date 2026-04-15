package com.graphhire.auth.domain.event;

import com.graphhire.auth.domain.model.User;
import com.graphhire.common.model.BaseAggregateRoot.DomainEvent;

public class UserLockedEvent extends DomainEvent {
    private final User user;

    public UserLockedEvent(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }
}