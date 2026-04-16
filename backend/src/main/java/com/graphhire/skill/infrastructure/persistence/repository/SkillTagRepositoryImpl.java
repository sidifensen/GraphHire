package com.graphhire.skill.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import com.graphhire.skill.domain.vo.SkillCategory;
import com.graphhire.skill.infrastructure.persistence.mapper.SkillTagMapper;
import com.graphhire.skill.infrastructure.persistence.po.SkillTagPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 技能标签仓储实现
 *
 * 【模块说明】提供技能标签数据的持久化操作，包括标签的增删改查和同义词管理。
 *
 * 【数据来源】skill_tag 表
 *
 * 【方法概览】
 * - findById：根据ID查询技能标签
 * - findByName：根据名称查询技能标签
 * - findBySynonym：根据同义词查询
 * - findByCategory：根据分类查询
 * - findAll：查询所有标签
 * - save：保存技能标签
 * - delete：删除技能标签
 * - findByNames：批量根据名称查询
 * - count：统计标签数量
 */
@Repository
public class SkillTagRepositoryImpl implements SkillTagRepository {

    @Autowired
    private SkillTagMapper skillTagMapper;

    /**
     * 根据ID查询技能标签
     */
    @Override
    public Optional<SkillTag> findById(Long id) {
        SkillTagPO po = skillTagMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    /**
     * 根据名称查询技能标签
     */
    @Override
    public Optional<SkillTag> findByName(String name) {
        SkillTagPO po = skillTagMapper.selectOne(
            new LambdaQueryWrapper<SkillTagPO>().eq(SkillTagPO::getName, name));
        return Optional.ofNullable(po).map(this::toDomain);
    }

    /**
     * 根据同义词查询技能标签
     */
    @Override
    public Optional<SkillTag> findBySynonym(String synonym) {
        // 当前schema的skill_tag表没有synonyms列，返回空
        return Optional.empty();
    }

    /**
     * 根据分类查询技能标签
     */
    @Override
    public List<SkillTag> findByCategory(SkillCategory category) {
        List<SkillTagPO> pos = skillTagMapper.selectList(
            new LambdaQueryWrapper<SkillTagPO>().eq(SkillTagPO::getCategory, category.name()));
        return pos.stream().map(this::toDomain).toList();
    }

    /**
     * 查询所有技能标签
     */
    @Override
    public List<SkillTag> findAll() {
        return skillTagMapper.selectList(null).stream().map(this::toDomain).toList();
    }

    /**
     * 保存技能标签
     */
    @Override
    public SkillTag save(SkillTag skillTag) {
        SkillTagPO po = toPO(skillTag);
        if (skillTag.getId() == null) {
            skillTagMapper.insert(po);
            skillTag.setId(po.getId());
        } else {
            skillTagMapper.updateById(po);
        }
        return skillTag;
    }

    /**
     * 删除技能标签
     */
    @Override
    public void delete(SkillTag skillTag) {
        if (skillTag.getId() != null) {
            skillTagMapper.deleteById(skillTag.getId());
        }
    }

    /**
     * 批量根据名称查询技能标签
     */
    @Override
    public List<SkillTag> findByNames(List<String> names) {
        List<SkillTagPO> pos = skillTagMapper.selectList(
            new LambdaQueryWrapper<SkillTagPO>().in(SkillTagPO::getName, names));
        return pos.stream().map(this::toDomain).toList();
    }

    /**
     * 统计技能标签数量
     */
    @Override
    public long count() {
        return skillTagMapper.selectCount(null);
    }

    /**
     * PO 转 Domain
     */
    private SkillTag toDomain(SkillTagPO po) {
        if (po == null) return null;
        SkillTag tag = new SkillTag();
        tag.setId(po.getId());
        tag.setName(po.getName());
        if (po.getCategory() != null) {
            tag.updateCategory(SkillCategory.valueOf(po.getCategory()));
        }
        return tag;
    }

    /**
     * Domain 转 PO
     */
    private SkillTagPO toPO(SkillTag tag) {
        SkillTagPO po = new SkillTagPO();
        po.setId(tag.getId());
        po.setName(tag.getName());
        po.setCategory(tag.getCategory() != null ? tag.getCategory().name() : null);
        return po;
    }
}