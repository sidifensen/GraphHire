package com.graphhire.resume.application.service;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
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

    private static final List<String> CATEGORY_KEYS = List.of("language", "framework", "database", "middleware", "frontend", "engineering");

    private static final Map<String, List<String>> CATEGORY_KEYWORDS = Map.of(
        "language", List.of("java", "python", "go", "javascript", "typescript", "kotlin", "jvm"),
        "framework", List.of("spring", "spring boot", "spring cloud", "mvc", "react", "vue", "mybatis", "drools"),
        "database", List.of("mysql", "postgresql", "redis", "elasticsearch", "sql", "nosql"),
        "middleware", List.of("rabbitmq", "kafka", "nacos", "gateway", "seata", "feign"),
        "frontend", List.of("html", "css", "javascript", "typescript", "react", "vue", "element"),
        "engineering", List.of("docker", "kubernetes", "ci", "cd", "aop", "线程池", "并发", "微服务")
    );

    private static final Map<String, List<String>> DOMAIN_KEYWORDS = Map.of(
        "java-backend", List.of("java", "jvm", "spring", "spring boot", "mybatis"),
        "distributed", List.of("spring cloud", "gateway", "nacos", "seata", "mq", "rabbitmq"),
        "frontend", List.of("javascript", "typescript", "react", "vue", "html", "css"),
        "storage", List.of("mysql", "redis", "elasticsearch")
    );

    private static final List<String> FRESHNESS_KEYWORDS = List.of(
        "spring cloud", "kubernetes", "docker", "react", "vue", "typescript", "elasticsearch", "gateway", "nacos"
    );

    private static final Map<String, Integer> RARITY_KEYWORDS = Map.ofEntries(
        Map.entry("kubernetes", 20),
        Map.entry("seata", 20),
        Map.entry("rabbitmq", 15),
        Map.entry("elasticsearch", 15),
        Map.entry("gateway", 15),
        Map.entry("spring cloud", 15),
        Map.entry("nacos", 15),
        Map.entry("drools", 20),
        Map.entry("aop", 10),
        Map.entry("mvcc", 15)
    );

    @Autowired
    private SkillGraphClient skillGraphClient;

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
            breadth * 0.25 + depth * 0.25 + structure * 0.20 + freshness * 0.15 + rarity * 0.15
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
        return clamp((int) Math.round((hitCategories.size() * 100.0) / CATEGORY_KEYS.size()));
    }

    private int calcDepth(List<String> skills) {
        if (CollUtil.isEmpty(skills)) {
            return 0;
        }
        double aggregate = DOMAIN_KEYWORDS.values().stream()
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
        long modernHits = skills.stream().filter(skill -> containsAny(skill, FRESHNESS_KEYWORDS)).count();
        int score = (int) Math.round((modernHits * 100.0) / Math.max(1, skills.size()));
        return clamp(score);
    }

    private int calcRarity(List<String> skills) {
        int total = skills.stream().mapToInt(skill -> RARITY_KEYWORDS.entrySet().stream()
            .filter(entry -> containsSkillKeyword(skill, entry.getKey()))
            .mapToInt(Map.Entry::getValue)
            .max()
            .orElse(0)).sum();
        return clamp(total);
    }

    private Set<String> detectCategories(List<String> skills) {
        Set<String> categories = new HashSet<>();
        for (String skill : skills) {
            for (String category : CATEGORY_KEYS) {
                if (containsAny(skill, CATEGORY_KEYWORDS.getOrDefault(category, List.of()))) {
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
