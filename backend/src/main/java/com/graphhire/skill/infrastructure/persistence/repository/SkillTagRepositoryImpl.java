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

@Repository
public class SkillTagRepositoryImpl implements SkillTagRepository {

    @Autowired
    private SkillTagMapper skillTagMapper;

    @Override
    public Optional<SkillTag> findById(Long id) {
        SkillTagPO po = skillTagMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public Optional<SkillTag> findByName(String name) {
        SkillTagPO po = skillTagMapper.selectOne(
            new LambdaQueryWrapper<SkillTagPO>().eq(SkillTagPO::getName, name));
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public Optional<SkillTag> findBySynonym(String synonym) {
        // skill_tag table doesn't have synonyms column in this schema - return empty
        return Optional.empty();
    }

    @Override
    public List<SkillTag> findByCategory(SkillCategory category) {
        List<SkillTagPO> pos = skillTagMapper.selectList(
            new LambdaQueryWrapper<SkillTagPO>().eq(SkillTagPO::getCategory, category.name()));
        return pos.stream().map(this::toDomain).toList();
    }

    @Override
    public List<SkillTag> findAll() {
        return skillTagMapper.selectList(null).stream().map(this::toDomain).toList();
    }

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

    @Override
    public void delete(SkillTag skillTag) {
        if (skillTag.getId() != null) {
            skillTagMapper.deleteById(skillTag.getId());
        }
    }

    @Override
    public List<SkillTag> findByNames(List<String> names) {
        List<SkillTagPO> pos = skillTagMapper.selectList(
            new LambdaQueryWrapper<SkillTagPO>().in(SkillTagPO::getName, names));
        return pos.stream().map(this::toDomain).toList();
    }

    @Override
    public long count() {
        return skillTagMapper.selectCount(null);
    }

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

    private SkillTagPO toPO(SkillTag tag) {
        SkillTagPO po = new SkillTagPO();
        po.setId(tag.getId());
        po.setName(tag.getName());
        po.setCategory(tag.getCategory() != null ? tag.getCategory().name() : null);
        return po;
    }
}