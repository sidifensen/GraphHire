package com.graphhire.match.domain.vo;

public final class RequirementScoreDetail {
    private final double cityScore;
    private final double salaryScore;
    private final double educationScore;

    private RequirementScoreDetail(double cityScore, double salaryScore, double educationScore) {
        this.cityScore = cityScore;
        this.salaryScore = salaryScore;
        this.educationScore = educationScore;
    }

    public static RequirementScoreDetail of(double cityScore, double salaryScore, double educationScore) {
        return new RequirementScoreDetail(cityScore, salaryScore, educationScore);
    }

    public double weighted(double cityWeight, double salaryWeight, double educationWeight) {
        return cityScore * cityWeight + salaryScore * salaryWeight + educationScore * educationWeight;
    }

    public double getCityScore() {
        return cityScore;
    }

    public double getSalaryScore() {
        return salaryScore;
    }

    public double getEducationScore() {
        return educationScore;
    }
}
