package com.graphhire.job.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;

/**
 * 企业持久化对象
 *
 * 【模块说明】与数据库company表结构一一对应，用于MyBatis-Plus CRUD操作。
 * 【数据表】company
 */
@TableName("company")
public class CompanyPO {
    /** 企业ID（主键，自增） */
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 用户ID（关联用户系统） */
    private Long userId;
    /** 企业名称 */
    private String companyName;
    /** 统一社会信用代码 */
    private String unifiedSocialCreditCode;
    /** 营业执照文件路径 */
    private String licensePath;
    /** 认证状态：0=待审核，1=已认证，2=已拒绝 */
    private Integer authStatus;
    /** 认证拒绝原因 */
    private String authReason;
    /** 认证时间 */
    private LocalDateTime authTime;
    /** 创建时间 */
    private LocalDateTime createdAt;
    /** 更新时间 */
    private LocalDateTime updatedAt;

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

    public String getLicensePath() {
        return licensePath;
    }

    public void setLicensePath(String licensePath) {
        this.licensePath = licensePath;
    }

    public Integer getAuthStatus() {
        return authStatus;
    }

    public void setAuthStatus(Integer authStatus) {
        this.authStatus = authStatus;
    }

    public String getAuthReason() {
        return authReason;
    }

    public void setAuthReason(String authReason) {
        this.authReason = authReason;
    }

    public LocalDateTime getAuthTime() {
        return authTime;
    }

    public void setAuthTime(LocalDateTime authTime) {
        this.authTime = authTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
