package com.graphhire.match.domain.vo;

/**
 * 匹配分数值对象
 * 仅保留技能匹配、岗位要求匹配和综合匹配三类核心分值
 */
public final class MatchScore {

    public static final double SKILL_WEIGHT = 0.6;
    public static final double REQUIREMENT_WEIGHT = 0.4;
    public static final double CITY_WEIGHT = 0.4;
    public static final double SALARY_WEIGHT = 0.3;
    public static final double EDUCATION_WEIGHT = 0.3;

    /** 综合匹配分 */
    private final double total;
    /** 技能匹配分 */
    private final double skillScore;
    /** 岗位要求匹配分 */
    private final double requirementScore;
    /** 岗位要求分细项 */
    private final RequirementScoreDetail requirementDetail;

    private MatchScore(double skillScore, double requirementScore, RequirementScoreDetail requirementDetail) {
        this.skillScore = skillScore;
        this.requirementScore = requirementScore;
        this.requirementDetail = requirementDetail;
        this.total = skillScore * SKILL_WEIGHT + requirementScore * REQUIREMENT_WEIGHT;
    }

    public static MatchScore of(double skillScore, double requirementScore) {
        return new MatchScore(skillScore, requirementScore, RequirementScoreDetail.of(0, 0, 0));
    }

    public static MatchScore of(double skillScore, RequirementScoreDetail detail) {
        double requirementScore = detail.weighted(CITY_WEIGHT, SALARY_WEIGHT, EDUCATION_WEIGHT);
        return new MatchScore(skillScore, requirementScore, detail);
    }

    public MatchLevel getLevel() {
        if (total >= 80) return MatchLevel.HIGH;
        if (total >= 50) return MatchLevel.MEDIUM;
        return MatchLevel.LOW;
    }

    public double getTotal() {
        return total;
    }

    public double getSkillScore() {
        return skillScore;
    }

    public double getRequirementScore() {
        return requirementScore;
    }

    public double getCityScore() {
        return requirementDetail.getCityScore();
    }

    public double getSalaryScore() {
        return requirementDetail.getSalaryScore();
    }

    public double getEducationScore() {
        return requirementDetail.getEducationScore();
    }
}
