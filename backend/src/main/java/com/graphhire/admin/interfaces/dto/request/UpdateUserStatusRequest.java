package com.graphhire.admin.interfaces.dto.request;

/**
 * 管理端更新用户状态请求
 */
public class UpdateUserStatusRequest {
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
