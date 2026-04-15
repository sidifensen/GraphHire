package com.graphhire.skill.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.skill.domain.vo.SkillCategory;

import java.util.HashSet;
import java.util.Set;

public class SkillTag extends BaseAggregateRoot {
    private Long id;
    private String name;
    private SkillCategory category;
    private Set<String> synonyms = new HashSet<>();
    private String description;
    private Integer usageCount = 0;

    public SkillTag() {
    }

    public SkillTag(String name, SkillCategory category) {
        this.name = name;
        this.category = category;
    }

    public void addSynonym(String synonym) {
        if (synonym != null && !synonym.isBlank()) {
            this.synonyms.add(synonym.trim().toLowerCase());
        }
    }

    public void removeSynonym(String synonym) {
        if (synonym != null) {
            this.synonyms.remove(synonym.trim().toLowerCase());
        }
    }

    public void updateCategory(SkillCategory newCategory) {
        if (newCategory == null) {
            throw new IllegalArgumentException("Category cannot be null");
        }
        this.category = newCategory;
    }

    public void incrementUsageCount() {
        this.usageCount++;
    }

    public void updateDescription(String description) {
        this.description = description;
    }

    public boolean matchesSynonym(String synonym) {
        if (synonym == null) return false;
        String normalizedSynonym = synonym.trim().toLowerCase();
        return this.synonyms.contains(normalizedSynonym) ||
               this.name.trim().toLowerCase().equals(normalizedSynonym);
    }

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

    public SkillCategory getCategory() {
        return category;
    }

    public Set<String> getSynonyms() {
        return synonyms;
    }

    public void setSynonyms(Set<String> synonyms) {
        this.synonyms = synonyms;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }
}
