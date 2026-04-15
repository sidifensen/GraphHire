package com.graphhire.skill.domain.vo;

public enum SkillCategory {
    PROGRAMMING_LANGUAGE("Programming Language"),
    FRAMEWORK("Framework"),
    DATABASE("Database"),
    TOOL("Tool"),
    SOFT_SKILL("Soft Skill"),
    DOMAIN("Domain Knowledge"),
    CERTIFICATION("Certification"),
    OTHER("Other");

    private final String description;

    SkillCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
