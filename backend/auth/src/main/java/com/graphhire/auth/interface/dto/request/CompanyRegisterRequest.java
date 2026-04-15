package com.graphhire.auth.interface.dto.request;

public class CompanyRegisterRequest {
    private String username;
    private String password;
    private String companyName;
    private String unifiedSocialCreditCode;

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

    public com.graphhire.auth.application.command.CompanyRegisterCmd toCmd() {
        com.graphhire.auth.application.command.CompanyRegisterCmd cmd = new com.graphhire.auth.application.command.CompanyRegisterCmd();
        cmd.setUsername(this.username);
        cmd.setPassword(this.password);
        cmd.setCompanyName(this.companyName);
        cmd.setUnifiedSocialCreditCode(this.unifiedSocialCreditCode);
        return cmd;
    }
}