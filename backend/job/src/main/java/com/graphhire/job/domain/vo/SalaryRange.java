package com.graphhire.job.domain.vo;

public final class SalaryRange {
    private final Integer min;
    private final Integer max;
    private final String unit; // 月/小时/年

    private SalaryRange(Integer min, Integer max, String unit) {
        if (min != null && max != null && min > max) {
            throw new IllegalArgumentException("min cannot greater than max");
        }
        this.min = min;
        this.max = max;
        this.unit = unit;
    }

    public static SalaryRange of(Integer min, Integer max, String unit) {
        return new SalaryRange(min, max, unit);
    }

    public static SalaryRange empty() {
        return new SalaryRange(null, null, null);
    }

    public boolean isInRange(Integer salary) {
        if (salary == null || min == null || max == null) {
            return false;
        }
        return salary >= min && salary <= max;
    }

    public Integer getMin() {
        return min;
    }

    public Integer getMax() {
        return max;
    }

    public String getUnit() {
        return unit;
    }

    public boolean isEmpty() {
        return min == null && max == null && unit == null;
    }
}
