package com.graphhire.skill.domain.vo;

/**
 * 技能分类枚举
 * 定义技能标签的分类体系，包括编程语言、框架、数据库、工具等类别
 */
public enum SkillCategory {
    /** 编程语言，如Java、Python、Go等 */
    PROGRAMMING_LANGUAGE("Programming Language"),
    /** 开发框架，如Spring、Django、React等 */
    FRAMEWORK("Framework"),
    /** 数据库技术，如MySQL、PostgreSQL、MongoDB等 */
    DATABASE("Database"),
    /** 开发工具，如Git、Docker、VSCode等 */
    TOOL("Tool"),
    /** 软技能，如沟通、团队协作、项目管理等 */
    SOFT_SKILL("Soft Skill"),
    /** 领域知识，如金融、医疗、电商等行业知识 */
    DOMAIN("Domain Knowledge"),
    /** 专业认证，如AWS认证、PMP等 */
    CERTIFICATION("Certification"),
    /** 其他技能 */
    OTHER("Other");

    /** 分类描述 */
    private final String description;

    SkillCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
