package com.graphhire.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.domain.model.SkillTag;
import com.graphhire.domain.repository.SkillTagRepository;
import com.graphhire.infrastructure.persistence.mapper.SkillTagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class SkillTagRepositoryImpl implements SkillTagRepository {
    private final SkillTagMapper skillTagMapper;

    @Override
    public SkillTag findById(Long id) {
        return skillTagMapper.selectById(id);
    }

    @Override
    public Optional<SkillTag> findByIdOptional(Long id) {
        return Optional.ofNullable(findById(id));
    }

    @Override
    public SkillTag findByTagName(String tagName) {
        return skillTagMapper.selectOne(new LambdaQueryWrapper<SkillTag>().eq(SkillTag::getTagName, tagName));
    }

    @Override
    public SkillTag save(SkillTag tag) {
        if (tag.getId() == null) {
            skillTagMapper.insert(tag);
        } else {
            skillTagMapper.updateById(tag);
        }
        return tag;
    }

    @Override
    public List<SkillTag> findAll() {
        return skillTagMapper.selectList(null);
    }

    @Override
    public List<SkillTag> findByCategory(String category) {
        return skillTagMapper.selectList(new LambdaQueryWrapper<SkillTag>().eq(SkillTag::getCategory, category));
    }

    @Override
    public void delete(Long id) {
        skillTagMapper.deleteById(id);
    }
}
