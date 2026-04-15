package com.graphhire.admin.application.command;

/**
 * Command for disabling a user account.
 */
public class DisableUserCmd {

    private Long userId;
    private String reason;

    public DisableUserCmd() {
    }

    public DisableUserCmd(Long userId, String reason) {
        this.userId = userId;
        this.reason = reason;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
