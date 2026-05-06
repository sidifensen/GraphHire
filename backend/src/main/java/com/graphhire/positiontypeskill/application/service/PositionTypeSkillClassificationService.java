package com.graphhire.positiontypeskill.application.service;

import cn.hutool.core.util.StrUtil;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import com.graphhire.positiontype.application.service.PositionTypeAppService;
import com.graphhire.positiontype.domain.model.PositionType;
import com.graphhire.skill.application.service.SkillTagAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PositionTypeSkillClassificationService {

    @Autowired
    private IndustrySkillProfileAppService profileAppService;

    @Autowired
    private PositionTypeAppService positionTypeAppService;

    @Autowired
    private SkillTagAppService skillTagAppService;

    @Autowired
    private DeepSeekClient deepSeekClient;

    @Autowired
    private IndustrySkillProfileBootstrapService bootstrapService;

    public Map<String, Object> classifyPersonSkills(List<String> rawSkills) {
        return classifyPersonSkills(rawSkills, null);
    }

    public Map<String, Object> classifyPersonSkills(List<String> rawSkills, Long preferredPositionTypeId) {
        List<String> normalizedSkills = skillTagAppService.normalizeSkills(rawSkills);
        if (normalizedSkills.isEmpty()) {
            return buildFallback();
        }

        PositionType preferredPositionType = resolvePreferredPositionType(preferredPositionTypeId);
        if (preferredPositionType != null) {
            return classifyByPositionType(normalizedSkills, preferredPositionType, true);
        }

        PositionType matchedPositionType = resolvePositionTypeBySkills(normalizedSkills);
        if (matchedPositionType == null) {
            return buildFallback();
        }

        return classifyByPositionType(normalizedSkills, matchedPositionType, false);
    }

    private Map<String, Object> classifyByPositionType(
        List<String> normalizedSkills,
        PositionType matchedPositionType,
        boolean allowBootstrapProfile
    ) {
        Long positionTypeId = matchedPositionType == null ? null : matchedPositionType.getId();
        String positionTypeName = matchedPositionType == null ? null : matchedPositionType.getName();
        if (positionTypeId == null) {
            return buildResult(List.of(), null, null);
        }

        Optional<com.graphhire.positiontypeskill.domain.model.IndustrySkillProfile> profileOpt =
            profileAppService.getByPositionTypeId(positionTypeId);
        if (profileOpt.isEmpty() && allowBootstrapProfile) {
            bootstrapService.bootstrapByPositionTypeId(positionTypeId);
            profileOpt = profileAppService.getByPositionTypeId(positionTypeId);
        }
        if (profileOpt.isEmpty()) {
            return buildResult(List.of(), positionTypeId, positionTypeName);
        }

        Map<String, Object> categoryResult = deepSeekClient.categorizeSkillsByProfile(normalizedSkills, profileOpt.get().getProfileJson());
        List<Map<String, Object>> skillCategories = parseCategoryList(categoryResult.get("skillCategories"));
        skillCategories = ensureNonEmptyCategoryAssignments(skillCategories, normalizedSkills);
        return buildResult(skillCategories, positionTypeId, positionTypeName);
    }

    private PositionType resolvePreferredPositionType(Long preferredPositionTypeId) {
        if (preferredPositionTypeId == null) {
            return null;
        }
        return positionTypeAppService.listAll().stream()
            .filter(item -> Objects.equals(item.getId(), preferredPositionTypeId))
            .filter(item -> Integer.valueOf(3).equals(item.getLevel()))
            .filter(item -> Integer.valueOf(1).equals(item.getStatus()))
            .filter(item -> !Integer.valueOf(1).equals(item.getDeleted()))
            .findFirst()
            .orElse(null);
    }

    private PositionType resolvePositionTypeBySkills(List<String> normalizedSkills) {
        if (normalizedSkills == null || normalizedSkills.isEmpty()) {
            return null;
        }
        List<PositionType> candidates = positionTypeAppService.listAll().stream()
            .filter(item -> Integer.valueOf(3).equals(item.getLevel()))
            .filter(item -> Integer.valueOf(1).equals(item.getStatus()))
            .filter(item -> !Integer.valueOf(1).equals(item.getDeleted()))
            .toList();
        PositionType best = null;
        int bestScore = 0;
        for (PositionType candidate : candidates) {
            String positionName = normalizeComparableName(candidate.getName());
            if (positionName.isBlank()) {
                continue;
            }
            int score = 0;
            for (String skill : normalizedSkills) {
                String skillNormalized = normalizeComparableName(skill);
                if (skillNormalized.isBlank()) {
                    continue;
                }
                if (skillNormalized.equals(positionName)) {
                    score += 6;
                    continue;
                }
                if (skillNormalized.contains(positionName) || positionName.contains(skillNormalized)) {
                    score += 3;
                    continue;
                }
                String skillHead = skillNormalized.length() >= 2 ? skillNormalized.substring(0, 2) : skillNormalized;
                if (!skillHead.isBlank() && positionName.contains(skillHead)) {
                    score += 1;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                best = candidate;
            }
        }
        return bestScore > 0 ? best : null;
    }

    private String normalizeComparableName(String text) {
        String normalized = StrUtil.blankToDefault(text, "").toLowerCase();
        normalized = normalized.replaceAll("[^a-z0-9\\u4e00-\\u9fa5]", "");
        return normalized;
    }

    private List<Map<String, Object>> ensureNonEmptyCategoryAssignments(
        List<Map<String, Object>> categories,
        List<String> normalizedSkills
    ) {
        if (categories == null || categories.isEmpty()) {
            return categories == null ? List.of() : categories;
        }
        boolean hasAnySkill = categories.stream()
            .anyMatch(item -> item.get("skills") instanceof List<?> skills && !skills.isEmpty());
        if (hasAnySkill || normalizedSkills == null || normalizedSkills.isEmpty()) {
            return categories;
        }
        Map<String, Object> first = categories.get(0);
        first.put("skills", new ArrayList<>(normalizedSkills));
        return categories;
    }

    private Map<String, Object> buildFallback() {
        return buildResult(List.of(), null, null);
    }

    private Map<String, Object> buildResult(
        List<Map<String, Object>> skillCategories,
        Long positionTypeId,
        String positionTypeName
    ) {
        Map<String, Object> positionTypeMatch = new HashMap<>();
        positionTypeMatch.put("positionTypeId", positionTypeId);
        positionTypeMatch.put("positionTypeName", positionTypeName);
        positionTypeMatch.put("matched", positionTypeId != null);

        Map<String, Object> result = new HashMap<>();
        result.put("positionTypeMatch", positionTypeMatch);
        result.put("skillCategories", skillCategories == null ? List.of() : skillCategories);
        return result;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseCategoryList(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        List<Map<String, Object>> categories = new ArrayList<>();
        for (Object item : list) {
            if (!(item instanceof Map<?, ?> rawMap)) {
                continue;
            }
            Map<String, Object> normalized = new HashMap<>();
            Object code = rawMap.get("code");
            Object name = rawMap.get("name");
            if (code == null || name == null) {
                continue;
            }
            normalized.put("code", String.valueOf(code));
            normalized.put("name", String.valueOf(name));
            Object skillsObj = rawMap.get("skills");
            if (skillsObj instanceof List<?> skillsRaw) {
                List<String> skills = skillsRaw.stream()
                    .map(String::valueOf)
                    .map(StrUtil::trimToNull)
                    .filter(StrUtil::isNotBlank)
                    .distinct()
                    .collect(Collectors.toList());
                normalized.put("skills", skills);
            } else {
                normalized.put("skills", List.of());
            }
            categories.add(normalized);
        }
        return categories;
    }
}
