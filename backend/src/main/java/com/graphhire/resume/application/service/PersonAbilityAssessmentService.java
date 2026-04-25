package com.graphhire.resume.application.service;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.graphhire.resume.config.AbilityAssessmentProperties;
import com.graphhire.resume.interfaces.dto.AbilityAssessmentResponse;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 基于技能标签的个人综合能力评估服务
 */
@Service
public class PersonAbilityAssessmentService {

    @Autowired
    private SkillGraphClient skillGraphClient;

    @Autowired
    private AbilityAssessmentProperties abilityAssessmentProperties;

    public AbilityAssessmentResponse assess(Long personId) {
        Map<String, Object> graph = skillGraphClient.getPersonSkillGraph(personId);
        List<String> skills = extractSkills(graph);
        if (CollUtil.isEmpty(skills)) {
            return new AbilityAssessmentResponse(
                0,
                "LOW",
                0,
                new AbilityAssessmentResponse.DimensionScores(0, 0, 0, 0, 0),
                Instant.now().toString()
            );
        }

        int breadth = calcBreadth(skills);
        int depth = calcDepth(skills);
        int structure = calcStructure(skills);
        int freshness = calcFreshness(skills);
        int rarity = calcRarity(skills);

        int totalScore = clamp((int) Math.round(
            breadth * abilityAssessmentProperties.getWeights().getBreadth()
                + depth * abilityAssessmentProperties.getWeights().getDepth()
                + structure * abilityAssessmentProperties.getWeights().getStructure()
                + freshness * abilityAssessmentProperties.getWeights().getFreshness()
                + rarity * abilityAssessmentProperties.getWeights().getRarity()
        ));

        return new AbilityAssessmentResponse(
            totalScore,
            resolveLevel(totalScore),
            skills.size(),
            new AbilityAssessmentResponse.DimensionScores(breadth, depth, structure, freshness, rarity),
            Instant.now().toString()
        );
    }

    private List<String> extractSkills(Map<String, Object> graph) {
        Object rawSkills = graph == null ? null : graph.get("skills");
        if (!(rawSkills instanceof Collection<?> collection)) {
            return List.of();
        }
        return collection.stream()
            .filter(Objects::nonNull)
            .map(item -> StrUtil.trim(item.toString()))
            .filter(StrUtil::isNotBlank)
            .distinct()
            .collect(Collectors.toList());
    }

    private int calcBreadth(List<String> skills) {
        Set<String> hitCategories = detectCategories(skills);
        int categorySize = Math.max(1, abilityAssessmentProperties.getCategoryKeys().size());
        return clamp((int) Math.round((hitCategories.size() * 100.0) / categorySize));
    }

    private int calcDepth(List<String> skills) {
        if (CollUtil.isEmpty(skills)) {
            return 0;
        }
        double aggregate = abilityAssessmentProperties.getDomainKeywords().values().stream()
            .mapToDouble(domainKeywords -> {
                long hit = skills.stream().filter(skill -> containsAny(skill, domainKeywords)).count();
                return Math.min(1.0, hit / (double) Math.max(1, domainKeywords.size())) * 100;
            })
            .average()
            .orElse(0.0);
        return clamp((int) Math.round(aggregate));
    }

    private int calcStructure(List<String> skills) {
        Set<String> categories = detectCategories(skills);
        if (categories.size() <= 1) {
            return clamp(Math.min(30, skills.size() * 5));
        }
        int crossLinks = Math.max(0, skills.size() - categories.size());
        int score = (int) Math.round(categories.size() * 12 + Math.min(28, crossLinks * 2));
        return clamp(score);
    }

    private int calcFreshness(List<String> skills) {
        long modernHits = skills.stream().filter(skill -> containsAny(skill, abilityAssessmentProperties.getFreshnessKeywords())).count();
        int score = (int) Math.round((modernHits * 100.0) / Math.max(1, skills.size()));
        return clamp(score);
    }

    private int calcRarity(List<String> skills) {
        int total = skills.stream().mapToInt(skill -> abilityAssessmentProperties.getRarityKeywords().entrySet().stream()
            .filter(entry -> containsSkillKeyword(skill, entry.getKey()))
            .mapToInt(Map.Entry::getValue)
            .max()
            .orElse(0)).sum();
        return clamp(total);
    }

    private Set<String> detectCategories(List<String> skills) {
        Set<String> categories = new HashSet<>();
        for (String skill : skills) {
            for (String category : abilityAssessmentProperties.getCategoryKeys()) {
                if (containsAny(skill, abilityAssessmentProperties.getCategoryKeywords().getOrDefault(category, List.of()))) {
                    categories.add(category);
                }
            }
        }
        return categories;
    }

    private boolean containsAny(String skill, List<String> keywords) {
        return keywords.stream().anyMatch(keyword -> containsSkillKeyword(skill, keyword));
    }

    private boolean containsSkillKeyword(String skill, String keyword) {
        return StrUtil.containsIgnoreCase(skill, keyword);
    }

    private int clamp(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private String resolveLevel(int totalScore) {
        if (totalScore >= 80) {
            return "HIGH";
        }
        if (totalScore >= 60) {
            return "MEDIUM";
        }
        return "LOW";
    }
}
