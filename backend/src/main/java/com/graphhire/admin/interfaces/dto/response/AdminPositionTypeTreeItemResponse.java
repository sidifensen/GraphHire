package com.graphhire.admin.interfaces.dto.response;

import java.util.ArrayList;
import java.util.List;

public class AdminPositionTypeTreeItemResponse {
    private Long id;
    private String name;
    private Long parentId;
    private Integer level;
    private Integer sortNo;
    private Integer status;
    private String createdAt;
    private String updatedAt;
    private List<AdminPositionTypeTreeItemResponse> children = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getSortNo() {
        return sortNo;
    }

    public void setSortNo(Integer sortNo) {
        this.sortNo = sortNo;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<AdminPositionTypeTreeItemResponse> getChildren() {
        return children;
    }

    public void setChildren(List<AdminPositionTypeTreeItemResponse> children) {
        this.children = children == null ? new ArrayList<>() : children;
    }
}
