package com.graphhire.match.domain.vo;

import java.util.List;

/**
 * 技能匹配结果值对象
 * 记录候选人技能与岗位要求的匹配情况：匹配的技能、缺失的技能、匹配率
 */
public final class SkillMatchResult {
    /** 已匹配的技能列表 */
    private final List<String> matchedSkills;
    /** 缺失的技能列表（岗位要求但候选人不具备） */
    private final List<String> missingSkills;
    /** 匹配率（0-100），已匹配技能数/要求技能总数 */
    private final double matchRate;

    public SkillMatchResult(List<String> matchedSkills, List<String> missingSkills, double matchRate) {
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.matchRate = matchRate;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public double getMatchRate() {
        return matchRate;
    }
}
