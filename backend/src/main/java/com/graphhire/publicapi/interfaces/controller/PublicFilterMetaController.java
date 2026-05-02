package com.graphhire.publicapi.interfaces.controller;

import com.graphhire.common.vo.Result;
import com.graphhire.industry.application.service.IndustryAppService;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.positiontype.application.service.PositionTypeAppService;
import com.graphhire.positiontype.domain.model.PositionType;
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

    @Autowired
    private PositionTypeAppService positionTypeAppService;

    @Autowired
    private IndustryAppService industryAppService;

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
}
