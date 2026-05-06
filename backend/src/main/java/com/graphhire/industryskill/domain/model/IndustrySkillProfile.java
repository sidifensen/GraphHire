package com.graphhire.industryskill.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;

import java.time.LocalDateTime;

public class IndustrySkillProfile extends BaseAggregateRoot {
    private Long id;
    private Long positionTypeId;
    private String profileJson;
    private Integer deleted;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPositionTypeId() {
        return positionTypeId;
    }

    public void setPositionTypeId(Long positionTypeId) {
        this.positionTypeId = positionTypeId;
    }

    public String getProfileJson() {
        return profileJson;
    }

    public void setProfileJson(String profileJson) {
        this.profileJson = profileJson;
    }

    public Integer getDeleted() {
        return deleted;
    }

    public void setDeleted(Integer deleted) {
        this.deleted = deleted;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}
