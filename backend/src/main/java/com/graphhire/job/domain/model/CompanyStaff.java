package com.graphhire.job.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;

public class CompanyStaff extends BaseAggregateRoot {
    private Long id;
    private Long companyId;
    private Long userId;
    private String post;  // OWNER, HR, RECRUITER

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