package com.graphhire.admin.interfaces.dto.request;

public class AdminIndustryCreateRequest {
    private String name;
    private Long parentId;
    private Integer enabled;
    private Integer sort;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public Integer getEnabled() { return enabled; }
    public void setEnabled(Integer enabled) { this.enabled = enabled; }
    public Integer getSort() { return sort; }
    public void setSort(Integer sort) { this.sort = sort; }
}
