package com.graphhire.positiontypeskill.application.service;

import com.graphhire.positiontypeskill.domain.model.IndustrySkillProfile;
import com.graphhire.positiontypeskill.domain.repository.IndustrySkillProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class IndustrySkillProfileAppService {

    private final IndustrySkillProfileRepository repository;

    @Autowired
    public IndustrySkillProfileAppService(IndustrySkillProfileRepository repository) {
        this.repository = repository;
    }

    public Optional<IndustrySkillProfile> getByPositionTypeId(Long positionTypeId) {
        return repository.findByPositionTypeId(positionTypeId);
    }

    public Optional<IndustrySkillProfile> findById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public IndustrySkillProfile saveOrUpdate(Long positionTypeId, String profileJson) {
        IndustrySkillProfile profile = repository.findByPositionTypeId(positionTypeId).orElseGet(IndustrySkillProfile::new);
        profile.setPositionTypeId(positionTypeId);
        profile.setProfileJson(profileJson);
        profile.setDeleted(0);
        return repository.save(profile);
    }
}
