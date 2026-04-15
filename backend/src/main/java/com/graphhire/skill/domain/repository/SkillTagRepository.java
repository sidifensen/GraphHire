package com.graphhire.skill.domain.repository;

import com.graphhire.skill.domain.model.SkillTag;

import java.util.List;
import java.util.Optional;

public interface SkillTagRepository {
    Optional<SkillTag> findById(Long id);

    Optional<SkillTag> findByName(String name);

    Optional<SkillTag> findBySynonym(String synonym);

    List<SkillTag> findByCategory(com.graphhire.skill.domain.vo.SkillCategory category);

    List<SkillTag> findAll();

    SkillTag save(SkillTag skillTag);

    void delete(SkillTag skillTag);

    List<SkillTag> findByNames(List<String> names);

    long count();
}
