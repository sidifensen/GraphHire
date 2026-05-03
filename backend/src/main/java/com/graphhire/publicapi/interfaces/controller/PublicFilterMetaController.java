package com.graphhire.publicapi.interfaces.controller;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.resource.ResourceUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.graphhire.common.vo.Result;
import com.graphhire.industry.application.service.IndustryAppService;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.positiontype.application.service.PositionTypeAppService;
import com.graphhire.positiontype.domain.model.PositionType;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/public")
public class PublicFilterMetaController {

    private static final String GEO_RESOURCE_PATH = "geo/cn-province-city.json";

    @Autowired
    private PositionTypeAppService positionTypeAppService;

    @Autowired
    private IndustryAppService industryAppService;

    private List<ProvinceCityResponse> provinceCities = List.of();

    @PostConstruct
    public void initProvinceCities() {
        String json = ResourceUtil.readUtf8Str(GEO_RESOURCE_PATH);
        JSONObject root = JSONUtil.parseObj(json);
        List<ProvinceCityResponse> result = new ArrayList<>();
        for (String province : root.keySet()) {
            List<String> cities = root.getBeanList(province, String.class).stream()
                    .filter(StrUtil::isNotBlank)
                    .map(StrUtil::trim)
                    .distinct()
                    .toList();
            if (CollUtil.isEmpty(cities) || StrUtil.isBlank(province)) {
                continue;
            }
            result.add(new ProvinceCityResponse(StrUtil.trim(province), cities));
        }
        provinceCities = List.copyOf(result);
    }

    @GetMapping("/position-types/tree")
    public Result<List<TreeItemResponse>> getPositionTypeTree() {
        List<PositionType> enabled = positionTypeAppService.listAll().stream()
                .filter(item -> item.getStatus() != null && item.getStatus() == 1)
                .toList();
        return Result.success(buildPositionTypeTree(enabled));
    }

    @GetMapping("/industries/tree")
    public Result<List<TreeItemResponse>> getIndustryTree() {
        List<Industry> enabled = industryAppService.listIndustries(1);
        return Result.success(buildIndustryTree(enabled));
    }

    @GetMapping("/geo/province-cities")
    public Result<List<ProvinceCityResponse>> getProvinceCities() {
        return Result.success(provinceCities);
    }

    private List<TreeItemResponse> buildPositionTypeTree(List<PositionType> items) {
        Map<Long, TreeItemResponse> map = new HashMap<>();
        for (PositionType item : items) {
            if (item.getId() == null) {
                continue;
            }
            map.put(item.getId(), new TreeItemResponse(
                    item.getId(),
                    item.getName(),
                    item.getParentId(),
                    item.getLevel(),
                    item.getSortNo(),
                    new ArrayList<>()
            ));
        }
        List<TreeItemResponse> roots = new ArrayList<>();
        for (PositionType item : items) {
            if (item.getId() == null) {
                continue;
            }
            TreeItemResponse current = map.get(item.getId());
            if (item.getParentId() == null || !map.containsKey(item.getParentId())) {
                roots.add(current);
                continue;
            }
            map.get(item.getParentId()).children().add(current);
        }
        roots.sort(Comparator.comparing(TreeItemResponse::sortNo, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(TreeItemResponse::id, Comparator.nullsLast(Long::compareTo)));
        sortChildrenRecursively(roots);
        return roots;
    }

    private List<TreeItemResponse> buildIndustryTree(List<Industry> items) {
        Map<Long, TreeItemResponse> map = new HashMap<>();
        for (Industry item : items) {
            if (item.getId() == null) {
                continue;
            }
            map.put(item.getId(), new TreeItemResponse(
                    item.getId(),
                    item.getName(),
                    item.getParentId(),
                    item.getLevel(),
                    item.getSort(),
                    new ArrayList<>()
            ));
        }
        List<TreeItemResponse> roots = new ArrayList<>();
        for (Industry item : items) {
            if (item.getId() == null) {
                continue;
            }
            TreeItemResponse current = map.get(item.getId());
            if (item.getParentId() == null || !map.containsKey(item.getParentId())) {
                roots.add(current);
                continue;
            }
            map.get(item.getParentId()).children().add(current);
        }
        roots.sort(Comparator.comparing(TreeItemResponse::sortNo, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(TreeItemResponse::id, Comparator.nullsLast(Long::compareTo)));
        sortChildrenRecursively(roots);
        return roots;
    }

    private void sortChildrenRecursively(List<TreeItemResponse> nodes) {
        for (TreeItemResponse node : nodes) {
            node.children().sort(Comparator.comparing(TreeItemResponse::sortNo, Comparator.nullsLast(Integer::compareTo))
                    .thenComparing(TreeItemResponse::id, Comparator.nullsLast(Long::compareTo)));
            if (!node.children().isEmpty()) {
                sortChildrenRecursively(node.children());
            }
        }
    }

    public record TreeItemResponse(
            Long id,
            String name,
            Long parentId,
            Integer level,
            Integer sortNo,
            List<TreeItemResponse> children
    ) {
        public TreeItemResponse {
            children = Objects.requireNonNullElseGet(children, ArrayList::new);
        }
    }

    public record ProvinceCityResponse(
            String province,
            List<String> cities
    ) {
        public ProvinceCityResponse {
            province = StrUtil.trim(province);
            cities = Objects.requireNonNullElseGet(cities, ArrayList::new);
        }
    }
}
