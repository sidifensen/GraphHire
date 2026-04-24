package com.graphhire.job.domain.vo;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 薪资范围值对象
 *
 * 【模块说明】表示职位薪资的范围，包含最低薪资、最高薪资和薪资单位。
 *            支持薪资校验（最低不超过最高）和范围包含判断。
 */
public final class SalaryRange {
    /** 最低薪资（单位由unit指定） */
    private final Integer min;
    /** 最高薪资（单位由unit指定） */
    private final Integer max;
    /** 薪资单位：月/小时/年 */
    private final String unit;

    private SalaryRange(Integer min, Integer max, String unit) {
        // 校验：最低薪资不能大于最高薪资
        if (min != null && max != null && min > max) {
            throw new IllegalArgumentException("min cannot greater than max");
        }
        this.min = min;
        this.max = max;
        this.unit = unit;
    }

    /** 工厂方法：创建薪资范围 */
    @JsonCreator
    public static SalaryRange of(@JsonProperty("min") Integer min,
                                 @JsonProperty("max") Integer max,
                                 @JsonProperty("unit") String unit) {
        return new SalaryRange(min, max, unit);
    }

    /** 工厂方法：创建空薪资范围 */
    public static SalaryRange empty() {
        return new SalaryRange(null, null, null);
    }

    /**
     * 判断指定薪资是否在当前范围内
     * @param salary 待校验的薪资值
     * @return true=在范围内，false=不在范围内或参数为null
     */
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

    /** 判断薪资范围是否为空（所有字段均为null） */
    public boolean isEmpty() {
        return min == null && max == null && unit == null;
    }
}
