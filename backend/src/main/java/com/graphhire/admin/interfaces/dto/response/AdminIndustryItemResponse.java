package com.graphhire.admin.interfaces.dto.response;

public class AdminIndustryItemResponse {
    private Long id;
    private String name;
    private Long parentId;
    private Integer level;
    private Integer enabled;
    private Integer sort;
    private String createdAt;
    private String updatedAt;
    private java.util.List<AdminIndustryItemResponse> children = new java.util.ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    public Integer getEnabled() { return enabled; }
    public void setEnabled(Integer enabled) { this.enabled = enabled; }
    public Integer getSort() { return sort; }
    public void setSort(Integer sort) { this.sort = sort; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    public java.util.List<AdminIndustryItemResponse> getChildren() { return children; }
    public void setChildren(java.util.List<AdminIndustryItemResponse> children) {
        this.children = children == null ? new java.util.ArrayList<>() : children;
    }
}
