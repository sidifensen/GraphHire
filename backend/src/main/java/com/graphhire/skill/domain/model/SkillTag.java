package com.graphhire.skill.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.skill.domain.vo.SkillCategory;

import java.util.HashSet;
import java.util.Set;

/**
 * 技能标签领域模型
 *
 * 【模块说明】管理技能标签的完整生命周期，包括标签信息、同义词管理、使用统计。
 *             技能标签是能力图谱的核心节点，用于简历与职位的智能匹配。
 *
 * 【同义词机制】
 * - 支持为技能标签添加多个同义词（如"Java"与"Java语言"）
 * - 匹配时同时支持标签名和同义词的模糊匹配
 *
 * 【使用场景】
 * - 简历解析时提取的技能会自动关联到对应标签
 * - 职位要求中的技能会与标签库进行标准化匹配
 */
public class SkillTag extends BaseAggregateRoot {
    /** 技能标签唯一标识 */
    private Long id;
    /** 技能标签名称，如"Java"、"Spring Boot" */
    private String name;
    /** 技能分类，用于分类检索和统计 */
    private SkillCategory category;
    /** 同义词集合，支持一个标签对应多个名称变体 */
    private Set<String> synonyms = new HashSet<>();
    /** 技能标签详细描述 */
    private String description;
    /** 使用计数，统计该技能在简历/职位中的出现次数 */
    private Integer usageCount = 0;

    public SkillTag() {
    }

    public SkillTag(String name, SkillCategory category) {
        this.name = name;
        this.category = category;
    }

    /**
     * 添加同义词
     * @param synonym 待添加的同义词，自动trim后转为小写存储
     */
    public void addSynonym(String synonym) {
        if (synonym != null && !synonym.isBlank()) {
            this.synonyms.add(synonym.trim().toLowerCase());
        }
    }

    /**
     * 移除同义词
     * @param synonym 待移除的同义词
     */
    public void removeSynonym(String synonym) {
        if (synonym != null) {
            this.synonyms.remove(synonym.trim().toLowerCase());
        }
    }

    /**
     * 更新技能分类
     * @param newCategory 新的分类，不允许为null
     * @throws IllegalArgumentException 当分类为null时抛出
     */
    public void updateCategory(SkillCategory newCategory) {
        if (newCategory == null) {
            throw new IllegalArgumentException("Category cannot be null");
        }
        this.category = newCategory;
    }

    /** 增加使用计数，用于统计技能的热门程度 */
    public void incrementUsageCount() {
        this.usageCount++;
    }

    /** 更新技能描述 */
    public void updateDescription(String description) {
        this.description = description;
    }

    /**
     * 检查给定词是否匹配该技能标签
     * 匹配规则：同义词集合包含该词，或标签名称完全匹配（忽略大小写）
     * @param synonym 待匹配的词
     * @return true表示匹配，false表示不匹配
     */
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
