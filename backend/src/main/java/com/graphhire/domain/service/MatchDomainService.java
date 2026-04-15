package com.graphhire.domain.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class MatchDomainService {

    private static final BigDecimal SKILL_WEIGHT = new BigDecimal("0.35");
    private static final BigDecimal EXPERIENCE_WEIGHT = new BigDecimal("0.20");
    private static final BigDecimal CITY_WEIGHT = new BigDecimal("0.15");
    private static final BigDecimal EDUCATION_WEIGHT = new BigDecimal("0.15");
    private static final BigDecimal SALARY_WEIGHT = new BigDecimal("0.15");

    public BigDecimal calculateSkillScore(List<String> personSkills, List<String> jobSkills) {
        if (personSkills == null || personSkills.isEmpty() || jobSkills == null || jobSkills.isEmpty()) {
            return BigDecimal.ZERO;
        }

        long matchCount = personSkills.stream()
                .filter(skill -> jobSkills.stream()
                        .anyMatch(jobSkill -> jobSkill.equalsIgnoreCase(skill) ||
                                jobSkill.toLowerCase().contains(skill.toLowerCase()) ||
                                skill.toLowerCase().contains(jobSkill.toLowerCase())))
                .count();

        return BigDecimal.valueOf(matchCount)
                .divide(BigDecimal.valueOf(jobSkills.size()), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }

    public BigDecimal calculateExperienceScore(Integer personYears, String jobExperience) {
        if (personYears == null) {
            return BigDecimal.ZERO;
        }

        int requiredYears = parseExperienceRequirement(jobExperience);
        if (requiredYears == 0) {
            return new BigDecimal("100");
        }

        if (personYears >= requiredYears) {
            return new BigDecimal("100");
        }

        return BigDecimal.valueOf(personYears)
                .divide(BigDecimal.valueOf(requiredYears), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }

    public BigDecimal calculateCityScore(String targetCity, String jobCity) {
        if (targetCity == null || jobCity == null || targetCity.isEmpty() || jobCity.isEmpty()) {
            return new BigDecimal("50");
        }

        if (targetCity.equals(jobCity) || targetCity.contains(jobCity) || jobCity.contains(targetCity)) {
            return new BigDecimal("100");
        }

        return BigDecimal.ZERO;
    }

    public BigDecimal calculateEducationScore(String personEducation, String jobEducation) {
        if (personEducation == null || jobEducation == null) {
            return new BigDecimal("50");
        }

        int personLevel = getEducationLevel(personEducation);
        int requiredLevel = getEducationLevel(jobEducation);

        if (personLevel >= requiredLevel) {
            return new BigDecimal("100");
        }

        return BigDecimal.valueOf(personLevel)
                .divide(BigDecimal.valueOf(requiredLevel), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }

    public BigDecimal calculateSalaryScore(Integer expectedSalary, Integer salaryMin, Integer salaryMax) {
        if (expectedSalary == null) {
            return new BigDecimal("50");
        }

        if (salaryMin == null && salaryMax == null) {
            return new BigDecimal("50");
        }

        int effectiveMin = salaryMin != null ? salaryMin : salaryMax;
        int effectiveMax = salaryMax != null ? salaryMax : salaryMin;

        if (expectedSalary >= effectiveMin && expectedSalary <= effectiveMax) {
            return new BigDecimal("100");
        }

        if (expectedSalary < effectiveMin) {
            return BigDecimal.valueOf(expectedSalary)
                    .divide(BigDecimal.valueOf(effectiveMin), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        return BigDecimal.valueOf(effectiveMax)
                .divide(BigDecimal.valueOf(expectedSalary), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }

    public BigDecimal calculateOverallScore(BigDecimal skillScore, BigDecimal experienceScore,
                                            BigDecimal cityScore, BigDecimal educationScore,
                                            BigDecimal salaryScore) {
        return skillScore.multiply(SKILL_WEIGHT)
                .add(experienceScore.multiply(EXPERIENCE_WEIGHT))
                .add(cityScore.multiply(CITY_WEIGHT))
                .add(educationScore.multiply(EDUCATION_WEIGHT))
                .add(salaryScore.multiply(SALARY_WEIGHT))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private int parseExperienceRequirement(String jobExperience) {
        if (jobExperience == null || jobExperience.isEmpty()) {
            return 0;
        }

        String lower = jobExperience.toLowerCase();
        if (lower.contains("不限") || lower.contains("经验")) {
            return 0;
        }

        String[] patterns = {"1-3", "3-5", "5-10", "10以上", "1-5", "3-10"};
        int[][] ranges = {{1, 3}, {3, 5}, {5, 10}, {10, Integer.MAX_VALUE}, {1, 5}, {3, 10}};

        for (int i = 0; i < patterns.length; i++) {
            if (lower.contains(patterns[i])) {
                return ranges[i][0];
            }
        }

        StringBuilder sb = new StringBuilder();
        for (char c : lower.toCharArray()) {
            if (Character.isDigit(c)) {
                sb.append(c);
            }
        }

        if (sb.length() > 0) {
            try {
                return Integer.parseInt(sb.toString());
            } catch (NumberFormatException e) {
                return 0;
            }
        }

        return 0;
    }

    private int getEducationLevel(String education) {
        if (education == null) {
            return 0;
        }

        String lower = education.toLowerCase();
        if (lower.contains("博士")) return 5;
        if (lower.contains("硕士")) return 4;
        if (lower.contains("本科") || lower.contains("学士")) return 3;
        if (lower.contains("大专")) return 2;
        if (lower.contains("高中") || lower.contains("中专") || lower.contains("职高")) return 1;
        return 0;
    }
}
