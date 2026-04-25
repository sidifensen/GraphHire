package com.graphhire.match.domain.service;

import cn.hutool.core.util.StrUtil;
import org.springframework.stereotype.Component;

@Component
public class CityMatchScorer {

    private final CityProvinceResolver resolver;

    public CityMatchScorer(CityProvinceResolver resolver) {
        this.resolver = resolver;
    }

    public double score(String userCity, String jobCity) {
        if (StrUtil.hasBlank(userCity, jobCity)) {
            return 50.0;
        }

        String normalizedUserCity = resolver.normalize(userCity);
        String normalizedJobCity = resolver.normalize(jobCity);
        if (StrUtil.equals(normalizedUserCity, normalizedJobCity)) {
            return 100.0;
        }

        String userProvince = resolver.resolveProvince(normalizedUserCity).orElse("");
        String jobProvince = resolver.resolveProvince(normalizedJobCity).orElse("");
        if (StrUtil.isNotBlank(userProvince) && StrUtil.equals(userProvince, jobProvince)) {
            return 70.0;
        }

        return 30.0;
    }
}
