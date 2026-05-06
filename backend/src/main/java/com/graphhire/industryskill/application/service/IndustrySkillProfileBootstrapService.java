package com.graphhire.industryskill.application.service;

import cn.hutool.json.JSONUtil;
import com.graphhire.industry.application.service.IndustryAppService;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class IndustrySkillProfileBootstrapService {

    @Autowired
    private IndustryAppService industryAppService;

    @Autowired
    private IndustrySkillProfileAppService profileAppService;

    @Autowired
    private DeepSeekClient deepSeekClient;

    @Transactional
    public int bootstrapAllLeafIndustries() {
        List<Industry> all = industryAppService.listIndustries(1);
        Map<Long, Industry> byId = all.stream()
            .filter(item -> item.getId() != null)
            .collect(Collectors.toMap(Industry::getId, item -> item, (left, right) -> left));
        List<Industry> leafIndustries = all.stream()
            .filter(item -> Integer.valueOf(2).equals(item.getLevel()))
            .toList();
        int affected = 0;
        for (Industry leaf : leafIndustries) {
            if (leaf.getId() == null) {
                continue;
            }
            Industry parent = leaf.getParentId() == null ? null : byId.get(leaf.getParentId());
            String parentName = parent == null ? null : parent.getName();
            Map<String, Object> generated = deepSeekClient.generateIndustryProfile(parentName, leaf.getName());
            String profileJson = normalizeProfileJson(generated, leaf.getName());
            profileAppService.saveOrUpdate(leaf.getId(), profileJson);
            affected++;
        }
        return affected;
    }

    @Transactional
    public void bootstrapByIndustryId(Long industryId) {
        if (industryId == null) {
            return;
        }
        List<Industry> all = industryAppService.listIndustries(1);
        Optional<Industry> leafOpt = all.stream()
            .filter(item -> Objects.equals(item.getId(), industryId))
            .filter(item -> Integer.valueOf(2).equals(item.getLevel()))
            .findFirst();
        if (leafOpt.isEmpty()) {
            return;
        }
        Industry leaf = leafOpt.get();
        Industry parent = all.stream()
            .filter(item -> Objects.equals(item.getId(), leaf.getParentId()))
            .findFirst()
            .orElse(null);
        String parentName = parent == null ? null : parent.getName();
        Map<String, Object> generated = deepSeekClient.generateIndustryProfile(parentName, leaf.getName());
        String profileJson = normalizeProfileJson(generated, leaf.getName());
        profileAppService.saveOrUpdate(leaf.getId(), profileJson);
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
