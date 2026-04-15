package com.graphhire.skill.domain.service;

import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.DomainService;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@DomainService
public class SkillTagDomainService {

    private final SkillTagRepository repository;

    @Autowired
    public SkillTagDomainService(SkillTagRepository repository) {
        this.repository = repository;
    }

    /**
     * Normalize raw skill names using SkillTag synonyms.
     * If a skill is found in the repository (by name or synonym), use the canonical name.
     * If not found, fall back to the original name.
     *
     * @param rawSkills list of raw skill names
     * @return normalized list of skill names
     */
    public List<String> normalize(List<String> rawSkills) {
        if (rawSkills == null || rawSkills.isEmpty()) {
            return new ArrayList<>();
        }

        Set<String> normalized = new HashSet<>();
        for (String skill : rawSkills) {
            if (skill == null || skill.isBlank()) {
                continue;
            }

            SkillTag tag = repository.findByName(skill.trim())
                .orElseGet(() -> repository.findBySynonym(skill.trim()).orElse(null));

            if (tag != null) {
                normalized.add(tag.getName());
            } else {
                // Fall back to original name if not found
                normalized.add(skill.trim());
            }
        }

        return new ArrayList<>(normalized);
    }

    /**
     * Find a SkillTag by name or any of its synonyms.
     *
     * @param nameOrSynonym the name or synonym to search
     * @return the SkillTag if found
     */
    public SkillTag findByNameOrSynonym(String nameOrSynonym) {
        return repository.findByName(nameOrSynonym)
            .orElseGet(() -> repository.findBySynonym(nameOrSynonym).orElse(null));
    }
}
