package com.graphhire.admin.interfaces.dto.request;

/**
 * 管理端企业审核更新请求
 */
public class AdminCompanyAuthUpdateRequest {
    private String status;
    private String rejectReason;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRejectReason() {
        return rejectReason;
    }

    public void setRejectReason(String rejectReason) {
        this.rejectReason = rejectReason;
    }
}
