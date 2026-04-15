package com.graphhire.match.domain.vo;

import java.util.List;

public final class SkillMatchResult {
    private final List<String> matchedSkills;
    private final List<String> missingSkills;
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
