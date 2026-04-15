package com.graphhire.match.domain.service;

import com.graphhire.skill.domain.repository.SkillTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SkillNormalizationService {

    @Autowired
    private SkillTagRepository skillTagRepository;

    public List<String> normalize(List<String> rawSkills) {
        Set<String> normalized = new HashSet<>();
        for (String skill : rawSkills) {
            if (skill == null || skill.isBlank()) {
                continue;
            }
            String trimmedSkill = skill.trim();
            skillTagRepository.findByName(trimmedSkill)
                .ifPresentOrElse(
                    tag -> normalized.add(tag.getName()),
                    () -> skillTagRepository.findBySynonym(trimmedSkill)
                        .ifPresent(tag -> normalized.add(tag.getName()))
                );
            if (!normalized.contains(trimmedSkill)) {
                normalized.add(trimmedSkill);
            }
        }
        return List.copyOf(normalized);
    }
}
