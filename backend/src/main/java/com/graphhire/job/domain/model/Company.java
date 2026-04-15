package com.graphhire.job.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.auth.domain.vo.AuthStatus;

public class Company extends BaseAggregateRoot {
    private Long id;
    private String name;
    private String unifiedSocialCreditCode;
    private AuthStatus authStatus = AuthStatus.PENDING_VERIFY;
    private String licenseUrl;
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    private String description;
    private String website;

    public void approve() {
        if (this.authStatus != AuthStatus.PENDING_VERIFY) {
            throw new IllegalStateException("只能审批待审核的企业");
        }
        this.authStatus = AuthStatus.VERIFIED;
    }

    public void reject() {
        if (this.authStatus != AuthStatus.PENDING_VERIFY) {
            throw new IllegalStateException("只能审批待审核的企业");
        }
        this.authStatus = AuthStatus.REJECTED;
    }

    public void updateInfo(String name, String contactName, String contactPhone,
                          String contactEmail, String description, String website) {
        this.name = name;
        this.contactName = contactName;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.description = description;
        this.website = website;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUnifiedSocialCreditCode() {
        return unifiedSocialCreditCode;
    }

    public void setUnifiedSocialCreditCode(String unifiedSocialCreditCode) {
        this.unifiedSocialCreditCode = unifiedSocialCreditCode;
    }

    public AuthStatus getAuthStatus() {
        return authStatus;
    }

    public void setAuthStatus(AuthStatus authStatus) {
        this.authStatus = authStatus;
    }

    public String getLicenseUrl() {
        return licenseUrl;
    }

    public void setLicenseUrl(String licenseUrl) {
        this.licenseUrl = licenseUrl;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }
}
