package com.graphhire.match.domain.service;

import com.graphhire.skill.domain.repository.SkillTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 技能名称标准化服务
 *
 * 【模块说明】将用户输入的原始技能名称标准化为规范术语，
 *             支持同义词映射，提高技能匹配的准确性。
 */
@Service
public class SkillNormalizationService {

    @Autowired
    private SkillTagRepository skillTagRepository;

    /**
     * 技能列表标准化
     * 【功能说明】对用户输入的原始技能列表进行标准化处理，包括精确匹配、同义词匹配等。
     * 【业务步骤】
     * 步骤1：遍历原始技能列表，过滤空值
     * 步骤2：精确匹配
     * 步骤3：同义词匹配
     * 步骤4：保留未匹配的原始技能
     */
    public List<SkillTag> normalize(List<String> rawSkills) {
        Set<String> normalized = new HashSet<>();
        for (String skill : rawSkills) {
            if (skill == null || skill.isBlank()) {
                continue;
            }
            String trimmedSkill = skill.trim();
            // 步骤2：精确匹配
            skillTagRepository.findByName(trimmedSkill)
                .ifPresentOrElse(
                    tag -> normalized.add(tag.getName()),
                    // 步骤3：同义词匹配
                    () -> skillTagRepository.findBySynonym(trimmedSkill)
                        .ifPresent(tag -> normalized.add(tag.getName()))
                );
            // 步骤4：保留未匹配的原始技能
            if (!normalized.contains(trimmedSkill)) {
                normalized.add(trimmedSkill);
            }
        }
        return List.copyOf(normalized);
    }
}
