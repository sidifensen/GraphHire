package com.graphhire.auth.domain.vo;

/**
 * 用户类型枚举
 * 区分平台内不同角色的用户
 */
public enum UserType {
    /** 个人用户（求职者） */
    PERSON,
    /** 企业用户（招聘方） */
    COMPANY,
    /** 管理员 */
    ADMIN
}