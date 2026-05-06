package com.graphhire.positiontypeskill.application.service;

import cn.hutool.json.JSONUtil;
import com.graphhire.positiontypeskill.domain.model.IndustrySkillProfile;
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
import java.util.regex.Pattern;

@Service
public class IndustrySkillProfileBootstrapService {
    private static final int FIXED_CATEGORY_COUNT = 5;
    private static final Pattern CODE_PATTERN = Pattern.compile("^[a-z0-9_]+$");

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
            Map<String, Object> generated = deepSeekClient.generatePositionTypeSkillProfile(parentName, leaf.getName());
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
        Map<String, Object> generated = deepSeekClient.generatePositionTypeSkillProfile(parentName, leaf.getName());
        String profileJson = normalizeProfileJson(generated, leaf.getName());
        profileAppService.saveOrUpdate(leaf.getId(), profileJson);
    }

    @Transactional
    public Optional<IndustrySkillProfile> regenerateProfileForRecordId(Long profileRecordId, boolean overwrite) {
        if (profileRecordId == null) {
            return Optional.empty();
        }
        return profileAppService.findById(profileRecordId).flatMap(profile -> {
            if (!overwrite && profile.getProfileJson() != null && !profile.getProfileJson().isBlank()) {
                return Optional.of(profile);
            }
            PositionType leaf;
            try {
                leaf = positionTypeAppService.getById(profile.getPositionTypeId());
            } catch (Exception ignored) {
                return Optional.empty();
            }
            if (leaf.getLevel() == null || leaf.getLevel() != 3) {
                return Optional.empty();
            }
            PositionType parent = resolveParent(positionTypeAppService.listAll(), leaf.getParentId());
            String parentName = parent == null ? null : parent.getName();
            Map<String, Object> generated = deepSeekClient.generatePositionTypeSkillProfile(parentName, leaf.getName());
            String profileJson = normalizeProfileJson(generated, leaf.getName());
            IndustrySkillProfile saved = profileAppService.saveOrUpdate(leaf.getId(), profileJson);
            return Optional.of(saved);
        });
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
        Integer categoryCount = normalizeCategoryCount(generated == null ? null : generated.get("categoryCount"));
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
                    String normalizedCode = String.valueOf(codeObj).trim().toLowerCase().replace(' ', '_');
                    if (!CODE_PATTERN.matcher(normalizedCode).matches()) {
                        return null;
                    }
                    Map<String, Object> normalized = new HashMap<>();
                    normalized.put("code", normalizedCode);
                    normalized.put("name", String.valueOf(nameObj).trim());
                    return normalized;
                })
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        } else {
            categories = List.of();
        }

        if (categoryCount != null && categoryCount > 0 && categories.size() > categoryCount) {
            categories = categories.subList(0, categoryCount);
        }

        if (categories.isEmpty()) {
            categories = defaultFiveCategories(childIndustryName);
        } else if (categories.size() < FIXED_CATEGORY_COUNT) {
            List<Map<String, Object>> padded = new java.util.ArrayList<>(categories);
            for (Map<String, Object> item : defaultFiveCategories(childIndustryName)) {
                if (padded.size() >= FIXED_CATEGORY_COUNT) {
                    break;
                }
                boolean exists = padded.stream().anyMatch(c -> Objects.equals(c.get("code"), item.get("code")));
                if (!exists) {
                    padded.add(item);
                }
            }
            categories = padded;
        } else if (categories.size() > FIXED_CATEGORY_COUNT) {
            categories = categories.subList(0, FIXED_CATEGORY_COUNT);
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("categories", categories);
        return JSONUtil.toJsonStr(profile);
    }

    private Integer normalizeCategoryCount(Object rawCategoryCount) {
        if (rawCategoryCount == null) {
            return null;
        }
        if (rawCategoryCount instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(rawCategoryCount));
        } catch (Exception ignored) {
            return null;
        }
    }

    private List<Map<String, Object>> defaultFiveCategories(String positionTypeName) {
        return List.of(
            category("core_skill", positionTypeName + "核心技能"),
            category("domain_knowledge", positionTypeName + "领域知识"),
            category("tooling", positionTypeName + "工具能力"),
            category("delivery", positionTypeName + "交付能力"),
            category("collaboration", positionTypeName + "协作能力")
        );
    }

    private Map<String, Object> category(String code, String name) {
        Map<String, Object> category = new HashMap<>();
        category.put("code", code);
        category.put("name", name);
        return category;
    }
}
