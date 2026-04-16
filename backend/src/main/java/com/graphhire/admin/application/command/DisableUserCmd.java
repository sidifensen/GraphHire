package com.graphhire.admin.application.command;

/**
 * 用户禁用命令
 * 【模块说明】封装管理员禁用/启用用户账号所需的参数
 */
public class DisableUserCmd {

    /** 待操作用户ID */
    private Long userId;
    /** 禁用状态：true-禁用账号，false-启用账号 */
    private Boolean disabled;

    public DisableUserCmd() {
    }

    public DisableUserCmd(Long userId, Boolean disabled) {
        this.userId = userId;
        this.disabled = disabled;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Boolean getDisabled() {
        return disabled;
    }

    public void setDisabled(Boolean disabled) {
        this.disabled = disabled;
    }
}
