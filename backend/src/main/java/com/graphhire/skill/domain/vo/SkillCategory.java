package com.graphhire.skill.domain.vo;

/**
 * 技能分类枚举
 * 定义技能标签的分类体系，包括编程语言、框架、数据库、工具等类别
 */
public enum SkillCategory {
    /** 技术技能 */
    技术技能("技术技能"),
    /** 软技能 */
    软技能("软技能");

    private final String description;

    SkillCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
