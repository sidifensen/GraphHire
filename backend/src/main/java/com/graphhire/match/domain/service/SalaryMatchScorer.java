package com.graphhire.match.domain.service;

import org.springframework.stereotype.Component;

@Component
public class SalaryMatchScorer {

    public double score(Integer expectedSalary, Integer minSalary, Integer maxSalary) {
        if (expectedSalary == null || minSalary == null || maxSalary == null || minSalary <= 0 || maxSalary <= 0 || minSalary > maxSalary) {
            return 50.0;
        }
        if (expectedSalary >= minSalary && expectedSalary <= maxSalary) {
            return 100.0;
        }

        double deviation;
        double baseline;
        if (expectedSalary < minSalary) {
            deviation = minSalary - expectedSalary;
            baseline = minSalary;
        } else {
            deviation = expectedSalary - maxSalary;
            baseline = maxSalary;
        }

        double ratio = deviation / Math.max(1.0, baseline);
        double score = 100.0 - ratio * 200.0;
        return Math.max(0.0, Math.min(100.0, score));
    }
}
