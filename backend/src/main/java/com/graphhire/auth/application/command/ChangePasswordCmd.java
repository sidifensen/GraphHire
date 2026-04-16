package com.graphhire.auth.application.command;

/**
 * 修改密码命令
 * 用于已登录用户修改密码时的请求参数（旧密码、新密码）
 */
public class ChangePasswordCmd {
    private String oldPassword;
    private String newPassword;

    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
