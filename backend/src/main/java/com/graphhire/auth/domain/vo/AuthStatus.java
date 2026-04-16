package com.graphhire.auth.domain.vo;

/**
 * 认证状态枚举
 * 表示用户账号的当前认证状态
 */
public enum AuthStatus {
    /** 待验证（注册后默认状态） */
    PENDING_VERIFY,
    /** 已验证 */
    VERIFIED,
    /** 已拒绝 */
    REJECTED,
    /** 已锁定（连续登录失败） */
    LOCKED,
    /** 已禁用 */
    DISABLED
}