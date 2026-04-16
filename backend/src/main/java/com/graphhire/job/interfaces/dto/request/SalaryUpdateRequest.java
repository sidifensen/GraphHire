package com.graphhire.job.interfaces.dto.request;

/**
 * 薪资更新请求
 */
public class SalaryUpdateRequest {
    private Integer min;
    private Integer max;
    private String unit;

    public Integer getMin() {
        return min;
    }

    public void setMin(Integer min) {
        this.min = min;
    }

    public Integer getMax() {
        return max;
    }

    public void setMax(Integer max) {
        this.max = max;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}