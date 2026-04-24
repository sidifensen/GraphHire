package com.graphhire.auth.interfaces.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CompanyRegisterRequest {
    @Email(message = "邮箱格式不正确")
    @NotBlank(message = "用户名不能为空")
    private String username;
    @NotBlank(message = "密码不能为空")
    private String password;
    @NotBlank(message = "公司名称不能为空")
    private String companyName;
    @NotBlank(message = "统一社会信用代码不能为空")
    private String unifiedSocialCreditCode;
    @NotBlank(message = "验证码不能为空")
    private String verifyCode;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getUnifiedSocialCreditCode() {
        return unifiedSocialCreditCode;
    }

    public void setUnifiedSocialCreditCode(String unifiedSocialCreditCode) {
        this.unifiedSocialCreditCode = unifiedSocialCreditCode;
    }

    public String getVerifyCode() {
        return verifyCode;
    }

    public void setVerifyCode(String verifyCode) {
        this.verifyCode = verifyCode;
    }

    public com.graphhire.auth.application.command.CompanyRegisterCmd toCmd() {
        com.graphhire.auth.application.command.CompanyRegisterCmd cmd = new com.graphhire.auth.application.command.CompanyRegisterCmd();
        cmd.setUsername(this.username);
        cmd.setPassword(this.password);
        cmd.setCompanyName(this.companyName);
        cmd.setUnifiedSocialCreditCode(this.unifiedSocialCreditCode);
        cmd.setVerifyCode(this.verifyCode);
        return cmd;
    }
}
