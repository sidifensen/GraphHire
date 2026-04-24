package com.graphhire.skill.domain.repository;

import com.graphhire.skill.domain.model.SkillTag;

import java.util.List;
import java.util.Optional;

/**
 * 技能标签仓储接口
 * 定义技能标签的持久化操作，包括查询、保存、删除等核心方法
 */
public interface SkillTagRepository {
    /** 根据ID查询技能标签 */
    Optional<SkillTag> findById(Long id);

    /** 根据名称查询技能标签（精确匹配） */
    Optional<SkillTag> findByName(String name);

    /** 根据别名查询技能标签（用于同义词匹配） */
    Optional<SkillTag> findBySynonym(String synonym);

    /** 查询所有技能标签 */
    List<SkillTag> findAll();

    /** 保存或更新技能标签 */
    SkillTag save(SkillTag skillTag);

    /** 删除技能标签 */
    void delete(SkillTag skillTag);

    /** 根据名称列表批量查询技能标签（用于批量导入/标准化场景） */
    List<SkillTag> findByNames(List<String> names);

    /** 统计技能标签总数 */
    long count();
}
