package com.graphhire.match.domain.service;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.resource.ResourceUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class CityProvinceResolver {

    private static final String GEO_RESOURCE_PATH = "geo/cn-province-city.json";

    private final Map<String, String> cityToProvince = new HashMap<>();

    @PostConstruct
    public void init() {
        String json = ResourceUtil.readUtf8Str(GEO_RESOURCE_PATH);
        JSONObject root = JSONUtil.parseObj(json);
        for (String province : root.keySet()) {
            List<String> cities = root.getBeanList(province, String.class);
            if (CollUtil.isEmpty(cities)) {
                continue;
            }
            for (String city : cities) {
                cityToProvince.put(normalize(city), province);
            }
        }
    }

    public Optional<String> resolveProvince(String city) {
        if (StrUtil.isBlank(city)) {
            return Optional.empty();
        }
        return Optional.ofNullable(cityToProvince.get(normalize(city)));
    }

    public String normalize(String city) {
        if (StrUtil.isBlank(city)) {
            return "";
        }
        String normalized = city.trim();
        normalized = StrUtil.removeSuffix(normalized, "市");
        normalized = StrUtil.removeSuffix(normalized, "地区");
        normalized = StrUtil.removeSuffix(normalized, "自治州");
        normalized = StrUtil.removeSuffix(normalized, "盟");
        normalized = StrUtil.removeSuffix(normalized, "特别行政区");
        return normalized;
    }
}
