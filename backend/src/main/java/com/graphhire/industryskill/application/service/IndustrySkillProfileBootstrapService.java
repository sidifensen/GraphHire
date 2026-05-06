package com.graphhire.industryskill.application.service;

import cn.hutool.json.JSONUtil;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import com.graphhire.positiontype.application.service.PositionTypeAppService;
import com.graphhire.positiontype.domain.model.PositionType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
public class IndustrySkillProfileBootstrapService {

    @Autowired
    private PositionTypeAppService positionTypeAppService;

    @Autowired
    private IndustrySkillProfileAppService profileAppService;

    @Autowired
    private DeepSeekClient deepSeekClient;

    @Transactional
    public int bootstrapAllLeafIndustries() {
        List<PositionType> all = positionTypeAppService.listAll();
        List<PositionType> leafPositionTypes = all.stream()
            .filter(item -> Integer.valueOf(3).equals(item.getLevel()))
            .filter(item -> Integer.valueOf(1).equals(item.getStatus()))
            .filter(item -> !Integer.valueOf(1).equals(item.getDeleted()))
            .toList();
        int affected = 0;
        for (PositionType leaf : leafPositionTypes) {
            if (leaf.getId() == null) {
                continue;
            }
            PositionType parent = resolveParent(all, leaf.getParentId());
            String parentName = parent == null ? null : parent.getName();
            Map<String, Object> generated = deepSeekClient.generateIndustryProfile(parentName, leaf.getName());
            String profileJson = normalizeProfileJson(generated, leaf.getName());
            profileAppService.saveOrUpdate(leaf.getId(), profileJson);
            affected++;
        }
        return affected;
    }

    @Transactional
    public void bootstrapByPositionTypeId(Long positionTypeId) {
        if (positionTypeId == null) {
            return;
        }
        List<PositionType> all = positionTypeAppService.listAll();
        Optional<PositionType> leafOpt = all.stream()
            .filter(item -> Objects.equals(item.getId(), positionTypeId))
            .filter(item -> Integer.valueOf(3).equals(item.getLevel()))
            .findFirst();
        if (leafOpt.isEmpty()) {
            return;
        }
        PositionType leaf = leafOpt.get();
        PositionType parent = resolveParent(all, leaf.getParentId());
        String parentName = parent == null ? null : parent.getName();
        Map<String, Object> generated = deepSeekClient.generateIndustryProfile(parentName, leaf.getName());
        String profileJson = normalizeProfileJson(generated, leaf.getName());
        profileAppService.saveOrUpdate(leaf.getId(), profileJson);
    }

    private PositionType resolveParent(List<PositionType> all, Long parentId) {
        if (parentId == null) {
            return null;
        }
        return all.stream()
            .filter(item -> Objects.equals(item.getId(), parentId))
            .findFirst()
            .orElse(null);
    }

    private String normalizeProfileJson(Map<String, Object> generated, String childIndustryName) {
        Object categoriesObj = generated == null ? null : generated.get("categories");
        List<Map<String, Object>> categories;
        if (categoriesObj instanceof List<?> rawCategories) {
            categories = rawCategories.stream()
                .filter(item -> item instanceof Map<?, ?>)
                .map(item -> {
                    Map<?, ?> map = (Map<?, ?>) item;
                    Object codeObj = map.get("code");
                    Object nameObj = map.get("name");
                    if (codeObj == null || nameObj == null) {
                        return null;
                    }
                    Map<String, Object> normalized = new HashMap<>();
                    normalized.put("code", String.valueOf(codeObj).trim().toLowerCase().replace(' ', '_'));
                    normalized.put("name", String.valueOf(nameObj).trim());
                    return normalized;
                })
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        } else {
            categories = List.of();
        }

        if (categories.size() < 5) {
            categories = List.of(
                category("core_skill", childIndustryName + "核心技能"),
                category("domain_knowledge", childIndustryName + "领域知识"),
                category("tooling", childIndustryName + "工具能力"),
                category("delivery", childIndustryName + "交付能力"),
                category("collaboration", childIndustryName + "协作能力")
            );
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("categories", categories);
        return JSONUtil.toJsonStr(profile);
    }

    private Map<String, Object> category(String code, String name) {
        Map<String, Object> category = new HashMap<>();
        category.put("code", code);
        category.put("name", name);
        return category;
    }
}
