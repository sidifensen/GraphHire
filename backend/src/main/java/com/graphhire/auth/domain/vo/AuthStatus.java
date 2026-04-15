package com.graphhire.auth.domain.vo;

public enum AuthStatus {
    PENDING_VERIFY,
    VERIFIED,
    REJECTED,
    LOCKED,
    DISABLED
}