package com.graphhire.job.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;

import java.math.BigDecimal;

public class JobSkill extends BaseAggregateRoot {
    private Long id;
    private Long jobId;
    private Long skillTagId;
    private Boolean isRequired;
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