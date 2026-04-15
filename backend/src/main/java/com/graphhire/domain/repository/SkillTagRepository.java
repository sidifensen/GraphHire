package com.graphhire.domain.repository;

import com.graphhire.domain.model.SkillTag;

import java.util.List;
import java.util.Optional;

public interface SkillTagRepository {
    SkillTag findById(Long id);
    Optional<SkillTag> findByIdOptional(Long id);
    SkillTag findByTagName(String tagName);
    SkillTag save(SkillTag tag);
    List<SkillTag> findAll();
    List<SkillTag> findByCategory(String category);
    void delete(Long id);
}
