package com.graphhire.match.domain.vo;

public final class MatchScore {
    private final double total;
    private final double skillScore;
    private final double expScore;
    private final double cityScore;
    private final double eduScore;
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
