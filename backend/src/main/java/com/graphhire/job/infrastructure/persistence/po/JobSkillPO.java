package com.graphhire.job.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.math.BigDecimal;

/**
 * 职位技能关联持久化对象
 *
 * 【模块说明】与数据库job_skill表结构一一对应，用于MyBatis-Plus CRUD操作。
 * 【数据表】job_skill
 */
@TableName("job_skill")
public class JobSkillPO {
    /** 记录ID（主键，自增） */
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 职位ID */
    private Long jobId;
    /** 技能标签ID */
    private Long skillTagId;
    /** 是否必填技能 */
    private Boolean isRequired;
    /** 技能权重（0.0-1.0） */
    private BigDecimal weight;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public Long getSkillTagId() {
        return skillTagId;
    }

    public void setSkillTagId(Long skillTagId) {
        this.skillTagId = skillTagId;
    }

    public Boolean getIsRequired() {
        return isRequired;
    }

    public void setIsRequired(Boolean isRequired) {
        this.isRequired = isRequired;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }
}
