package com.graphhire.industryskill.application.service;

import cn.hutool.core.util.StrUtil;
import com.graphhire.industry.application.service.IndustryAppService;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import com.graphhire.skill.application.service.SkillTagAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class IndustrySkillClassificationService {

    @Autowired
    private IndustryAppService industryAppService;

    @Autowired
    private IndustrySkillProfileAppService profileAppService;

    @Autowired
    private SkillTagAppService skillTagAppService;

    @Autowired
    private DeepSeekClient deepSeekClient;

    public Map<String, Object> classifyPersonSkills(List<String> rawSkills) {
        List<String> normalizedSkills = skillTagAppService.normalizeSkills(rawSkills);
        if (normalizedSkills.isEmpty()) {
            return buildFallback();
        }

        List<Industry> allEnabled = industryAppService.listIndustries(1);
        List<Industry> parents = allEnabled.stream()
            .filter(i -> Integer.valueOf(1).equals(i.getLevel()))
            .toList();
        List<Industry> children = allEnabled.stream()
            .filter(i -> Integer.valueOf(2).equals(i.getLevel()))
            .toList();

        List<Map<String, Object>> parentCandidates = parents.stream()
            .map(this::toCandidate)
            .toList();
        Map<String, Object> firstPass = deepSeekClient.classifyIndustryFirstPass(normalizedSkills, parentCandidates);
        List<Long> parentIds = parseLongList(firstPass.get("parentIndustryIds"));
        if (parentIds.isEmpty()) {
            parentIds = parents.stream().map(Industry::getId).filter(Objects::nonNull).toList();
        }
        Set<Long> parentIdSet = Set.copyOf(parentIds);
        List<Map<String, Object>> childCandidates = children.stream()
            .filter(item -> item.getParentId() != null && parentIdSet.contains(item.getParentId()))
            .map(this::toCandidate)
            .toList();
        if (childCandidates.isEmpty()) {
            childCandidates = children.stream().map(this::toCandidate).toList();
        }

        Map<String, Object> secondPass = deepSeekClient.classifyIndustrySecondPass(normalizedSkills, childCandidates);
        Long industryId = parseLong(secondPass.get("industryId"));
        String industryName = secondPass.get("industryName") == null ? null : String.valueOf(secondPass.get("industryName"));
        if (industryId == null) {
            return buildFallback();
        }
        if (StrUtil.isBlank(industryName)) {
            industryName = children.stream()
                .filter(item -> Objects.equals(item.getId(), industryId))
                .map(Industry::getName)
                .findFirst()
                .orElse(null);
        }

        Optional<com.graphhire.industryskill.domain.model.IndustrySkillProfile> profileOpt = profileAppService.getByIndustryId(industryId);
        if (profileOpt.isEmpty()) {
            return buildResult(industryId, industryName, List.of());
        }

        Map<String, Object> categoryResult = deepSeekClient.categorizeSkillsByProfile(normalizedSkills, profileOpt.get().getProfileJson());
        List<Map<String, Object>> skillCategories = parseCategoryList(categoryResult.get("skillCategories"));
        return buildResult(industryId, industryName, skillCategories);
    }

    private Map<String, Object> toCandidate(Industry industry) {
        Map<String, Object> candidate = new HashMap<>();
        candidate.put("id", industry.getId());
        candidate.put("name", industry.getName());
        return candidate;
    }

    private Map<String, Object> buildFallback() {
        return buildResult(null, null, List.of());
    }

    private Map<String, Object> buildResult(Long industryId, String industryName, List<Map<String, Object>> skillCategories) {
        Map<String, Object> industryMatch = new HashMap<>();
        industryMatch.put("industryId", industryId);
        industryMatch.put("industryName", industryName);
        industryMatch.put("matched", industryId != null);

        Map<String, Object> result = new HashMap<>();
        result.put("industryMatch", industryMatch);
        result.put("skillCategories", skillCategories == null ? List.of() : skillCategories);
        return result;
    }

    private List<Long> parseLongList(Object value) {
        if (!(value instanceof List<?> raw)) {
            return List.of();
        }
        return raw.stream()
            .map(this::parseLong)
            .filter(Objects::nonNull)
            .toList();
    }

    private Long parseLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception e) {
            return null;
        }
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
