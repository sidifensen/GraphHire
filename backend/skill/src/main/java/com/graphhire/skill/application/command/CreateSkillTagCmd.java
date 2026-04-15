package com.graphhire.skill.application.command;

import com.graphhire.skill.domain.vo.SkillCategory;

public class CreateSkillTagCmd {
    private String name;
    private SkillCategory category;
    private String description;

    public CreateSkillTagCmd() {
    }

    public CreateSkillTagCmd(String name, SkillCategory category, String description) {
        this.name = name;
        this.category = category;
        this.description = description;
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

    public void setCategory(SkillCategory category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
