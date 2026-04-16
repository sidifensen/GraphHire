package com.graphhire.admin.application.command;

/**
 * 企业认证审批命令
 * 【模块说明】封装管理员对企业进行认证审批所需的参数：审批ID、是否通过、拒绝原因
 */
public class AuthCompanyCmd {

    /** 待审批企业ID */
    private Long companyId;
    /** 是否通过认证：true-通过，false-拒绝 */
    private boolean approved;
    /** 拒绝原因（审批拒绝时必填） */
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
