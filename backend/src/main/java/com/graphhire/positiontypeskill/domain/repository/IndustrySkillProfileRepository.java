package com.graphhire.positiontypeskill.domain.repository;

import com.graphhire.positiontypeskill.domain.model.IndustrySkillProfile;

import java.util.List;
import java.util.Optional;

public interface IndustrySkillProfileRepository {
    Optional<IndustrySkillProfile> findById(Long id);
    Optional<IndustrySkillProfile> findByPositionTypeId(Long positionTypeId);
    List<IndustrySkillProfile> findAll();
    IndustrySkillProfile save(IndustrySkillProfile profile);
}
