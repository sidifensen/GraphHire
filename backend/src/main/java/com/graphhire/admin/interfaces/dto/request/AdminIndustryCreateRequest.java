package com.graphhire.admin.interfaces.dto.request;

public class AdminIndustryCreateRequest {
    private String name;
    private Integer enabled;
    private Integer sortOrder;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getEnabled() { return enabled; }
    public void setEnabled(Integer enabled) { this.enabled = enabled; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
