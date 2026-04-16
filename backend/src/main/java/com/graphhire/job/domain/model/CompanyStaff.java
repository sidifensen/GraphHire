package com.graphhire.job.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;

/**
 * 企业员工领域模型
 *
 * 【模块说明】管理企业内部员工的职能角色，关联用户与企业之间的关系。
 *
 * 【岗位角色】
 * - OWNER：企业所有者/管理员
 * - HR：人事专员
 * - RECRUITER：招聘专员
 */
public class CompanyStaff extends BaseAggregateRoot {
    /** 记录ID（主键） */
    private Long id;
    /** 企业ID */
    private Long companyId;
    /** 用户ID（关联用户系统） */
    private Long userId;
    /** 岗位角色：OWNER/HR/RECRUITER */
    private String post;

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
}
