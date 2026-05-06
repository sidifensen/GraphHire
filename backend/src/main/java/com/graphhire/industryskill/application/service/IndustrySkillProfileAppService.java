package com.graphhire.industryskill.application.service;

import com.graphhire.industryskill.domain.model.IndustrySkillProfile;
import com.graphhire.industryskill.domain.repository.IndustrySkillProfileRepository;
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

    public Optional<IndustrySkillProfile> getByIndustryId(Long industryId) {
        return repository.findByIndustryId(industryId);
    }

    @Transactional
    public IndustrySkillProfile saveOrUpdate(Long industryId, String profileJson) {
        IndustrySkillProfile profile = repository.findByIndustryId(industryId).orElseGet(IndustrySkillProfile::new);
        profile.setIndustryId(industryId);
        profile.setProfileJson(profileJson);
        profile.setDeleted(0);
        return repository.save(profile);
    }
}
