package com.graphhire.auth.interfaces.dto.request;

public class CompanyRegisterRequest {
    private String username;
    private String password;
    private String companyName;
    private String unifiedSocialCreditCode;
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