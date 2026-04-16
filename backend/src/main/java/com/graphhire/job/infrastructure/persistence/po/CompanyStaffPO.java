package com.graphhire.job.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.LocalDateTime;

/**
 * 企业员工持久化对象
 *
 * 【模块说明】与数据库company_staff表结构一一对应，用于MyBatis-Plus CRUD操作。
 * 【数据表】company_staff
 */
@TableName("company_staff")
public class CompanyStaffPO {
    /** 记录ID（主键，自增） */
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 企业ID */
    private Long companyId;
    /** 用户ID */
    private Long userId;
    /** 岗位角色：OWNER/HR/RECRUITER */
    private String post;
    /** 创建时间 */
    private LocalDateTime createdAt;

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
