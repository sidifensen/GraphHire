package com.graphhire.admin.interfaces.dto.response;

import java.util.ArrayList;
import java.util.List;

public class AdminSkillItemResponse {
    private Long id;
    private String name;
    private String category;
    private List<String> synonyms = new ArrayList<>();
    private long jobCount;
    private String createdAt;
    private String updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public List<String> getSynonyms() { return synonyms; }
    public void setSynonyms(List<String> synonyms) { this.synonyms = synonyms; }
    public long getJobCount() { return jobCount; }
    public void setJobCount(long jobCount) { this.jobCount = jobCount; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
