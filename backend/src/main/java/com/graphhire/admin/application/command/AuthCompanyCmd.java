package com.graphhire.admin.application.command;

/**
 * Command for company authentication (approve/reject).
 */
public class AuthCompanyCmd {

    private Long companyId;
    private boolean approved;
    private String reason;

    public AuthCompanyCmd() {
    }

    public AuthCompanyCmd(Long companyId, boolean approved, String reason) {
        this.companyId = companyId;
        this.approved = approved;
        this.reason = reason;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
