package com.graphhire.skill.domain.service;

import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 技能标签领域服务
 *
 * 【模块说明】提供技能标签的标准化和查询功能，支持同义词匹配和分类管理。
 *
 * 【方法概览】
 * - normalize：技能列表标准化
 * - findByNameOrSynonym：根据名称或同义词查询
 */
@Service
public class SkillTagDomainService {

    private final SkillTagRepository repository;

    @Autowired
    public SkillTagDomainService(SkillTagRepository repository) {
        this.repository = repository;
    }

    /**
     * 技能列表标准化
     * 【功能说明】对用户输入的原始技能列表进行标准化处理，识别同义词并归类。
     * 【业务步骤】
     * 步骤1：遍历原始技能列表
     * 步骤2：精确匹配技能标签
     * 步骤3：同义词匹配
     * 步骤4：返回标准化结果
     * @param rawSkills 原始技能名称列表
     * @return 标准化后的技能名称列表
     */
    public List<String> normalize(List<String> rawSkills) {
        // 步骤1：遍历原始技能列表
        if (rawSkills == null || rawSkills.isEmpty()) {
            return new ArrayList<>();
        }

        Set<String> normalized = new HashSet<>();
        for (String skill : rawSkills) {
            if (skill == null || skill.isBlank()) {
                continue;
            }

            // 步骤2：精确匹配技能标签
            // 步骤3：同义词匹配
            SkillTag tag = repository.findByName(skill.trim())
                .orElseGet(() -> repository.findBySynonym(skill.trim()).orElse(null));

            if (tag != null) {
                normalized.add(tag.getName());
            } else {
                // 未找到匹配项，回退到原始名称
                normalized.add(skill.trim());
            }
        }

        // 步骤4：返回标准化结果
        return new ArrayList<>(normalized);
    }

    /**
     * 根据名称或同义词查询技能标签
     * 【功能说明】通过技能标签名称或同义词查找对应的技能标签。
     * @param name 技能标签名称或同义词
     * @return 匹配的技能标签，不存在返回 null
     */
    public SkillTag findByNameOrSynonym(String name) {
        return repository.findByName(name)
            .orElseGet(() -> repository.findBySynonym(name).orElse(null));
    }
}
