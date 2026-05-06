package com.graphhire.positiontype.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.positiontype.domain.model.PositionType;
import com.graphhire.positiontype.domain.repository.PositionTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
public class PositionTypeAppService {

    @Autowired
    private PositionTypeRepository positionTypeRepository;

    public List<PositionType> listAll() {
        return positionTypeRepository.findAllNotDeletedOrdered();
    }

    public PositionType getById(Long id) {
        return positionTypeRepository.findById(id).orElseThrow(() -> Exceptions.BusinessException.of("职位类型不存在"));
    }

    @Transactional
    public PositionType createPositionType(String name, Long parentId, Integer status) {
        String normalizedName = normalizeName(name);
        List<PositionType> all = new ArrayList<>(positionTypeRepository.findAllNotDeletedOrdered());
        PositionType parent = null;
        int level = 1;
        if (parentId != null) {
            parent = positionTypeRepository.findById(parentId).orElseThrow(() -> Exceptions.BusinessException.of("职位类型不存在"));
            if (parent.getLevel() != null && parent.getLevel() >= 3) {
                throw Exceptions.BusinessException.of("仅支持三级分类");
            }
            level = parent.getLevel() + 1;
        }
        ensureNoDuplicateName(all, parentId, normalizedName, null);

        PositionType item = new PositionType();
        item.setName(normalizedName);
        item.setParentId(parent == null ? null : parent.getId());
        item.setLevel(level);
        item.setStatus(status == null ? 1 : status);
        item.setDeleted(0);
        item.setSortNo(nextSiblingSortNo(all, parentId));
        return positionTypeRepository.save(item);
    }

    @Transactional
    public PositionType updatePositionType(Long id, String name) {
        PositionType target = getById(id);
        if (name != null && !name.isBlank()) {
            String normalizedName = normalizeName(name);
            ensureNoDuplicateName(positionTypeRepository.findAllNotDeletedOrdered(), target.getParentId(), normalizedName, id);
            target.setName(normalizedName);
        }
        return positionTypeRepository.save(target);
    }

    @Transactional
    public PositionType updatePositionTypeStatus(Long id, Integer status) {
        PositionType target = getById(id);
        int nextStatus = status == null ? 1 : status;
        List<PositionType> all = new ArrayList<>(positionTypeRepository.findAllNotDeletedOrdered());
        Map<Long, PositionType> map = toMap(all);
        if (nextStatus == 0) {
            List<PositionType> descendants = findDescendants(target.getId(), all);
            target.setStatus(0);
            positionTypeRepository.save(target);
            for (PositionType item : descendants) {
                item.setStatus(0);
                positionTypeRepository.save(item);
            }
            return target;
        }

        List<PositionType> ancestors = findAncestors(target, map);
        for (PositionType ancestor : ancestors) {
            ancestor.setStatus(1);
            positionTypeRepository.save(ancestor);
        }
        target.setStatus(1);
        return positionTypeRepository.save(target);
    }

    @Transactional
    public PositionType movePositionType(Long id, String direction) {
        PositionType target = getById(id);
        List<PositionType> all = positionTypeRepository.findAllNotDeletedOrdered();
        List<PositionType> siblings = all.stream()
                .filter(item -> Objects.equals(item.getParentId(), target.getParentId()))
                .sorted(Comparator.comparing(item -> item.getSortNo() == null ? Integer.MAX_VALUE : item.getSortNo()))
                .toList();
        int currentIndex = indexOf(siblings, id);
        int nextIndex = resolveTargetIndex(currentIndex, siblings.size(), direction);
        if (nextIndex == currentIndex) {
            return target;
        }

        List<PositionType> reordered = new ArrayList<>(siblings);
        PositionType swap = reordered.get(nextIndex);
        reordered.set(nextIndex, reordered.get(currentIndex));
        reordered.set(currentIndex, swap);
        persistSiblingOrder(reordered);
        return reordered.get(nextIndex);
    }

    private void persistSiblingOrder(List<PositionType> siblings) {
        for (int i = 0; i < siblings.size(); i++) {
            PositionType item = siblings.get(i);
            item.setSortNo(i);
            positionTypeRepository.save(item);
        }
    }

    private int resolveTargetIndex(int currentIndex, int total, String direction) {
        String normalized = direction == null ? "" : direction.trim().toUpperCase(Locale.ROOT);
        if ("UP".equals(normalized)) {
            return Math.max(0, currentIndex - 1);
        }
        if ("DOWN".equals(normalized)) {
            return Math.min(total - 1, currentIndex + 1);
        }
        return currentIndex;
    }

    private int indexOf(List<PositionType> list, Long id) {
        for (int i = 0; i < list.size(); i++) {
            if (Objects.equals(list.get(i).getId(), id)) {
                return i;
            }
        }
        throw Exceptions.BusinessException.of("职位类型不存在");
    }

    private Map<Long, PositionType> toMap(List<PositionType> list) {
        Map<Long, PositionType> map = new HashMap<>();
        for (PositionType item : list) {
            map.put(item.getId(), item);
        }
        return map;
    }

    private List<PositionType> findAncestors(PositionType target, Map<Long, PositionType> allById) {
        List<PositionType> ancestors = new ArrayList<>();
        Long parentId = target.getParentId();
        while (parentId != null) {
            PositionType parent = allById.get(parentId);
            if (parent == null) {
                break;
            }
            ancestors.add(0, parent);
            parentId = parent.getParentId();
        }
        return ancestors;
    }

    private List<PositionType> findDescendants(Long rootId, List<PositionType> all) {
        List<PositionType> descendants = new ArrayList<>();
        List<Long> queue = new ArrayList<>();
        queue.add(rootId);
        int index = 0;
        while (index < queue.size()) {
            Long parentId = queue.get(index++);
            for (PositionType item : all) {
                if (Objects.equals(item.getParentId(), parentId)) {
                    descendants.add(item);
                    queue.add(item.getId());
                }
            }
        }
        return descendants;
    }

    private void ensureNoDuplicateName(List<PositionType> all, Long parentId, String name, Long excludeId) {
        boolean duplicated = all.stream().anyMatch(item ->
                Objects.equals(item.getParentId(), parentId)
                        && !Objects.equals(item.getId(), excludeId)
                        && item.getName() != null
                        && item.getName().trim().equalsIgnoreCase(name));
        if (duplicated) {
            throw Exceptions.BusinessException.of("同级职位类型名称已存在");
        }
    }

    private int nextSiblingSortNo(List<PositionType> all, Long parentId) {
        int max = -1;
        for (PositionType item : all) {
            if (Objects.equals(item.getParentId(), parentId)) {
                max = Math.max(max, item.getSortNo() == null ? -1 : item.getSortNo());
            }
        }
        return max + 1;
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw Exceptions.BusinessException.of("职位类型名称不能为空");
        }
        return name.trim();
    }

}
