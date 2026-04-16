package com.graphhire.job.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;

import java.math.BigDecimal;

/**
 * 职位技能关联领域模型
 *
 * 【模块说明】建立职位与技能标签之间的多对多关联关系，支持必填/优先区分及权重配置。
 *            用于人岗匹配算法中的技能匹配度计算。
 */
public class JobSkill extends BaseAggregateRoot {
    /** 记录ID（主键） */
    private Long id;
    /** 职位ID */
    private Long jobId;
    /** 技能标签ID（关联技能表） */
    private Long skillTagId;
    /** 是否为必填技能（true=必填，false=优先） */
    private Boolean isRequired;
    /** 技能权重（用于匹配算法），取值范围0.0-1.0 */
    private BigDecimal weight;

    public JobSkill() {
    }

    public JobSkill(Long jobId, Long skillTagId, Boolean isRequired, BigDecimal weight) {
        this.jobId = jobId;
        this.skillTagId = skillTagId;
        this.isRequired = isRequired;
        this.weight = weight;
    }

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
