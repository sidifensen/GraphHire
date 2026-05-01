package com.graphhire.job.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.auth.domain.vo.AuthStatus;
import java.time.LocalDateTime;

/**
 * 企业领域模型
 *
 * 【模块说明】管理企业账号的注册、认证审核、信息维护等核心功能。
 *
 * 【认证状态机】
 * - PENDING_VERIFY：待审核，管理员审批前状态
 * - VERIFIED：已认证，审核通过
 * - REJECTED/DISABLED：认证失败/账号被禁用
 *
 * 【核心操作】
 * - approve()：审批通过，将认证状态变更为VERIFIED
 * - reject()：审批拒绝，将认证状态变更为REJECTED
 */
public class Company extends BaseAggregateRoot {
    /** 企业ID（主键） */
    private Long id;
    /** 企业创建者用户ID */
    private Long userId;
    /** 企业名称 */
    private String name;
    /** 统一社会信用代码 */
    private String unifiedSocialCreditCode;
    /** 认证状态：PENDING_VERIFY/VERIFIED/REJECTED/LOCKED/DISABLED */
    private AuthStatus authStatus = AuthStatus.PENDING_VERIFY;
    /** 营业执照文件存储路径 */
    private String licenseUrl;
    /** 联系人姓名 */
    private String contactName;
    /** 联系人电话 */
    private String contactPhone;
    /** 联系人邮箱 */
    private String contactEmail;
    /** 企业简介 */
    private String description;
    /** 企业官网URL */
    private String website;
    /** 企业头像对象路径 */
    private String avatarPath;
    /** 所属行业ID */
    private Long industryId;
    /** 企业规模 */
    private String scale;
    /** 企业地址 */
    private String address;
    /** 创建时间 */
    private LocalDateTime createTime;
    /** 更新时间 */
    private LocalDateTime updatedAt;

    /**
     * 审批通过
     * 【功能说明】将企业认证状态变更为已认证，仅允许待审核状态的企业操作。
     */
    public void approve() {
        // 校验：仅待审核状态可审批
        if (this.authStatus != AuthStatus.PENDING_VERIFY) {
            throw new IllegalStateException("只能审批待审核的企业");
        }
        this.authStatus = AuthStatus.VERIFIED;
    }

    /**
     * 审批拒绝
     * 【功能说明】将企业认证状态变更为已拒绝，仅允许待审核状态的企业操作。
     */
    public void reject() {
        // 校验：仅待审核状态可审批
        if (this.authStatus != AuthStatus.PENDING_VERIFY) {
            throw new IllegalStateException("只能审批待审核的企业");
        }
        this.authStatus = AuthStatus.REJECTED;
    }

    /**
     * 更新企业信息
     * 【功能说明】批量更新企业的联系信息和简介描述。
     */
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public String getAvatarPath() {
        return avatarPath;
    }

    public void setAvatarPath(String avatarPath) {
        this.avatarPath = avatarPath;
    }

    public Long getIndustryId() {
        return industryId;
    }

    public void setIndustryId(Long industryId) {
        this.industryId = industryId;
    }

    public String getScale() {
        return scale;
    }

    public void setScale(String scale) {
        this.scale = scale;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

