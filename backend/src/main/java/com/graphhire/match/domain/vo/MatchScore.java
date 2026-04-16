package com.graphhire.match.domain.vo;

/**
 * 匹配分数值对象
 * 包含五个维度的单项分数及加权总分，用于衡量人岗匹配质量
 */
public final class MatchScore {
    /** 加权总分（权重：技能50%、经验20%、城市15%、学历10%、薪资5%） */
    private final double total;
    /** 技能匹配分数（0-100） */
    private final double skillScore;
    /** 经验匹配分数（0-100） */
    private final double expScore;
    /** 城市匹配分数（0-100） */
    private final double cityScore;
    /** 学历匹配分数（0-100） */
    private final double eduScore;
    /** 薪资匹配分数（0-100） */
    private final double salScore;

    private MatchScore(double skill, double exp, double city, double edu, double sal) {
        this.skillScore = skill;
        this.expScore = exp;
        this.cityScore = city;
        this.eduScore = edu;
        this.salScore = sal;
        this.total = skill * 0.5 + exp * 0.2 + city * 0.15 + edu * 0.1 + sal * 0.05;
    }

    public static MatchScore of(double skill, double exp, double city, double edu, double sal) {
        return new MatchScore(skill, exp, city, edu, sal);
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

    public double getExpScore() {
        return expScore;
    }

    public double getCityScore() {
        return cityScore;
    }

    public double getEduScore() {
        return eduScore;
    }

    public double getSalScore() {
        return salScore;
    }
}
