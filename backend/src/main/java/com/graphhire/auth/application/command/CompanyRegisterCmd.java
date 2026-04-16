package com.graphhire.auth.application.command;

import com.graphhire.auth.domain.vo.Username;

/**
 * 企业用户注册命令
 * 封装企业用户注册所需的参数
 */
public class CompanyRegisterCmd {
    /** 用户名（邮箱格式） */
    private String username;
    /** 明文密码（后续会被 BCrypt 加密） */
    private String password;
    /** 企业名称 */
    private String companyName;
    /** 统一社会信用代码 */
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
}