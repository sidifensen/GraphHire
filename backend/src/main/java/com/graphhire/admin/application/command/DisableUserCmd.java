package com.graphhire.admin.application.command;

/**
 * Command for disabling a user account.
 */
public class DisableUserCmd {

    private Long userId;
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
