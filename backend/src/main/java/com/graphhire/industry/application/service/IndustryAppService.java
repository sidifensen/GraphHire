package com.graphhire.industry.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.industry.domain.repository.IndustryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class IndustryAppService {

    @Autowired
    private IndustryRepository industryRepository;

    public List<Industry> listIndustries(Integer enabled) {
        return listIndustries(enabled, IndustryRepository.SORT_BY_SORT, "asc");
    }

    public List<Industry> listIndustries(Integer enabled, String sortBy, String sortDir) {
        normalizeAllSortByParent();
        if (enabled == null) {
            return industryRepository.findAllOrdered(sortBy, sortDir);
        }
        return industryRepository.findByEnabledOrdered(enabled, sortBy, sortDir);
    }

    public List<Industry> listTree(Integer enabled) {
        return listIndustries(enabled, IndustryRepository.SORT_BY_SORT, "asc");
    }

    public Industry getIndustryById(Long id) {
        return industryRepository.findById(id)
                .orElseThrow(() -> Exceptions.BusinessException.of("行业不存在"));
    }

    public Industry getEnabledIndustryById(Long id) {
        Industry industry = getIndustryById(id);
        if (industry.getEnabled() == null || industry.getEnabled() != 1) {
            throw Exceptions.BusinessException.of("行业已停用");
        }
        if (!isLeaf(industry)) {
            throw Exceptions.BusinessException.of("请选择二级行业");
        }
        return industry;
    }

    @Transactional
    public Industry createIndustry(String name, Long parentId, Integer enabled, Integer sort) {
        String normalizedName = normalizeName(name);
        Industry parent = null;
        int level = 1;
        if (parentId != null) {
            parent = getIndustryById(parentId);
            if (parent.getLevel() == null || parent.getLevel() != 1) {
                throw Exceptions.BusinessException.of("仅支持创建两级行业");
            }
            level = 2;
        }
        ensureNoDuplicateName(parentId, normalizedName, null);

        List<Industry> siblings = getSiblings(parentId);
        normalizeSortOrderForList(siblings);
        persistIndustryOrder(siblings);

        Industry industry = new Industry();
        industry.setName(normalizedName);
        industry.setParentId(parent == null ? null : parent.getId());
        industry.setLevel(level);
        industry.setEnabled(enabled == null ? 1 : enabled);
        industry.setSort(sort == null ? siblings.size() : Math.max(sort, 0));
        industry.setDeleted(0);
        return industryRepository.save(industry);
    }

    @Transactional
    public Industry updateIndustry(Long id, String name, Integer sort) {
        Industry industry = getIndustryById(id);
        if (name != null && !name.isBlank()) {
            String normalizedName = normalizeName(name);
            ensureNoDuplicateName(industry.getParentId(), normalizedName, id);
            industry.setName(normalizedName);
        }
        if (sort != null) {
            industry.setSort(Math.max(0, sort));
        }
        return industryRepository.save(industry);
    }

    @Transactional
    public Industry updateIndustryStatus(Long id, Integer enabled) {
        int next = enabled == null ? 1 : enabled;
        Industry industry = getIndustryById(id);
        List<Industry> all = new ArrayList<>(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT, "asc"));
        Map<Long, Industry> byId = toMap(all);

        if (industry.getLevel() != null && industry.getLevel() == 1) {
            // 父类状态变更级联子类
            industry.setEnabled(next);
            industryRepository.save(industry);
            for (Industry child : all) {
                if (Objects.equals(child.getParentId(), industry.getId())) {
                    child.setEnabled(next);
                    industryRepository.save(child);
                }
            }
            return industry;
        }

        if (next == 1 && industry.getParentId() != null) {
            Industry parent = byId.get(industry.getParentId());
            if (parent != null && (parent.getEnabled() == null || parent.getEnabled() != 1)) {
                parent.setEnabled(1);
                industryRepository.save(parent);
            }
        }
        industry.setEnabled(next);
        return industryRepository.save(industry);
    }

    @Transactional
    public Industry moveIndustry(Long id, String direction) {
        Industry target = getIndustryById(id);
        List<Industry> siblings = new ArrayList<>(getSiblings(target.getParentId()));
        siblings.sort(Comparator.comparing(item -> item.getSort() == null ? Integer.MAX_VALUE : item.getSort()));

        int currentIndex = findIndexById(siblings, id);
        int nextIndex = resolveTargetIndex(currentIndex, siblings.size(), direction);
        if (nextIndex == currentIndex) {
            persistIndustryOrder(siblings);
            return target;
        }
        Industry swap = siblings.get(nextIndex);
        siblings.set(nextIndex, siblings.get(currentIndex));
        siblings.set(currentIndex, swap);
        persistIndustryOrder(siblings);
        return siblings.get(nextIndex);
    }

    @Transactional
    public void deleteIndustry(Long id) {
        Industry target = getIndustryById(id);
        List<Industry> all = new ArrayList<>(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT, "asc"));
        if (target.getLevel() != null && target.getLevel() == 1) {
            for (Industry child : all) {
                if (Objects.equals(child.getParentId(), target.getId())) {
                    industryRepository.softDeleteById(child.getId());
                }
            }
        }
        industryRepository.softDeleteById(id);
    }

    public Map<Long, List<Industry>> groupByParent(List<Industry> list) {
        Map<Long, List<Industry>> grouped = new HashMap<>();
        for (Industry item : list) {
            Long parentId = item.getParentId() == null ? 0L : item.getParentId();
            grouped.computeIfAbsent(parentId, key -> new ArrayList<>()).add(item);
        }
        for (List<Industry> siblings : grouped.values()) {
            siblings.sort(Comparator.comparing(ind -> ind.getSort() == null ? Integer.MAX_VALUE : ind.getSort()));
        }
        return grouped;
    }

    private List<Industry> getSiblings(Long parentId) {
        List<Industry> all = new ArrayList<>(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT, "asc"));
        List<Industry> siblings = new ArrayList<>();
        for (Industry item : all) {
            if (Objects.equals(item.getParentId(), parentId)) {
                siblings.add(item);
            }
        }
        return siblings;
    }

    private void ensureNoDuplicateName(Long parentId, String name, Long excludeId) {
        Industry found = industryRepository.findByNameAndParentId(name, parentId).orElse(null);
        if (found != null && !Objects.equals(found.getId(), excludeId)) {
            throw Exceptions.BusinessException.of("同级行业名称已存在");
        }
    }

    private int findIndexById(List<Industry> industries, Long id) {
        for (int i = 0; i < industries.size(); i++) {
            if (Objects.equals(industries.get(i).getId(), id)) {
                return i;
            }
        }
        throw Exceptions.BusinessException.of("行业不存在");
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

    private void normalizeAllSortByParent() {
        List<Industry> all = new ArrayList<>(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT, "asc"));
        Map<Long, List<Industry>> grouped = groupByParent(all);
        boolean changed = false;
        for (List<Industry> siblings : grouped.values()) {
            changed |= normalizeSortOrderForList(siblings);
        }
        if (changed) {
            for (List<Industry> siblings : grouped.values()) {
                persistIndustryOrder(siblings);
            }
        }
    }

    private boolean normalizeSortOrderForList(List<Industry> industries) {
        boolean changed = false;
        for (int i = 0; i < industries.size(); i++) {
            Industry item = industries.get(i);
            if (item.getSort() == null || item.getSort() != i) {
                item.setSort(i);
                changed = true;
            }
        }
        return changed;
    }

    private void persistIndustryOrder(List<Industry> industries) {
        // preserve order uniqueness and compactness
        Set<Long> seen = new LinkedHashSet<>();
        int idx = 0;
        for (Industry item : industries) {
            if (item.getId() == null || seen.contains(item.getId())) {
                continue;
            }
            seen.add(item.getId());
            item.setSort(idx++);
            industryRepository.save(item);
        }
    }

    private Map<Long, Industry> toMap(List<Industry> all) {
        Map<Long, Industry> byId = new HashMap<>();
        for (Industry item : all) {
            byId.put(item.getId(), item);
        }
        return byId;
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw Exceptions.BusinessException.of("行业名称不能为空");
        }
        return name.trim();
    }

    private boolean isLeaf(Industry industry) {
        return industry.getLevel() != null && industry.getLevel() == 2;
    }
}

