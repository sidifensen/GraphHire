package com.graphhire.industryskill.domain.repository;

import com.graphhire.industryskill.domain.model.IndustrySkillProfile;

import java.util.List;
import java.util.Optional;

public interface IndustrySkillProfileRepository {
    Optional<IndustrySkillProfile> findByPositionTypeId(Long positionTypeId);
    List<IndustrySkillProfile> findAll();
    IndustrySkillProfile save(IndustrySkillProfile profile);
}
