package com.graphhire.common.model;

import java.time.LocalDateTime;

/**
 * 基础实体类，所有业务实体需继承此类
 * 提供通用审计字段：ID、创建时间、更新时间、软删除标记
 */
public abstract class BaseEntity {
    /** 主键ID */
    private Long id;
    /** 创建时间 */
    private LocalDateTime createTime;
    /** 更新时间 */
    private LocalDateTime updateTime;
    /** 软删除标记：true-已删除，false-未删除 */
    private Boolean deleted;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }
}
