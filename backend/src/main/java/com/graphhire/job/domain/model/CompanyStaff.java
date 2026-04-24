package com.graphhire.job.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;

/**
 * 企业员工领域模型
 *
 * 【模块说明】管理企业内部员工的职能角色，关联用户与企业之间的关系。
 *
 * 【岗位角色】
 * - OWNER：企业所有者/管理员
 * - HR：企业员工（管理员）
 */
public class CompanyStaff extends BaseAggregateRoot {
    public static final String POST_OWNER = "OWNER";
    public static final String POST_HR = "HR";
    public static final String STATUS_PENDING_JOIN = "PENDING_JOIN";
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_DISABLED = "DISABLED";
    /** 记录ID（主键） */
    private Long id;
    /** 企业ID */
    private Long companyId;
    /** 用户ID（关联用户系统） */
    private Long userId;
    /** 岗位角色：OWNER/HR */
    private String post;
    /** 员工状态：PENDING_JOIN/ACTIVE/REJECTED/DISABLED */
    private String status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPost() {
        return post;
    }

    public void setPost(String post) {
        this.post = post;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
