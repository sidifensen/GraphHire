package com.graphhire.job.domain.vo;

import cn.hutool.core.util.StrUtil;

import java.util.Arrays;
import java.util.Optional;

public enum CompanyScale {
    SCALE_0_20("1", "0-20人"),
    SCALE_20_99("2", "20-99人"),
    SCALE_100_499("3", "100-499人"),
    SCALE_500_999("4", "500-999人"),
    SCALE_1000_9999("5", "1000-9999人"),
    SCALE_10000_PLUS("6", "10000人以上");

    private final String code;
    private final String label;

    CompanyScale(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public String getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public static Optional<CompanyScale> fromInput(String input) {
        if (StrUtil.isBlank(input)) {
            return Optional.empty();
        }
        String value = StrUtil.trim(input);
        return Arrays.stream(values())
                .filter(item -> StrUtil.equals(item.code, value) || StrUtil.equals(item.label, value))
                .findFirst();
    }

    public static String toLabel(String input) {
        if (StrUtil.isBlank(input)) {
            return null;
        }
        return fromInput(input).map(CompanyScale::getLabel).orElse(input);
    }
}
