package com.graphhire.industry.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.industry.domain.repository.IndustryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class IndustryAppService {

    @Autowired
    private IndustryRepository industryRepository;

    public List<Industry> listIndustries(Integer enabled) {
        return listIndustries(enabled, IndustryRepository.SORT_BY_SORT_ORDER, "asc");
    }

    public List<Industry> listIndustries(Integer enabled, String sortBy, String sortDir) {
        normalizeAllSortOrders();
        if (enabled == null) {
            return industryRepository.findAllOrdered(sortBy, sortDir);
        }
        return industryRepository.findByEnabledOrdered(enabled, sortBy, sortDir);
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
        return industry;
    }

    @Transactional
    public Industry createIndustry(String name, Integer enabled, Integer sortOrder) {
        industryRepository.findByName(name).ifPresent(existing -> {
            throw Exceptions.BusinessException.of("行业名称已存在");
        });
        List<Industry> all = industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT_ORDER, "asc");
        boolean changed = normalizeSortOrderForList(all);
        if (changed) {
            persistIndustryOrder(all);
        }
        Industry industry = new Industry();
        industry.setName(name);
        industry.setEnabled(enabled == null ? 1 : enabled);
        industry.setSortOrder(sortOrder == null ? all.size() : sortOrder);
        return industryRepository.save(industry);
    }

    @Transactional
    public Industry updateIndustry(Long id, String name, Integer sortOrder) {
        Industry industry = getIndustryById(id);
        if (name != null && !name.isBlank() && !name.equals(industry.getName())) {
            industryRepository.findByName(name).ifPresent(existing -> {
                throw Exceptions.BusinessException.of("行业名称已存在");
            });
            industry.setName(name);
        }
        if (sortOrder != null) {
            industry.setSortOrder(sortOrder);
        }
        return industryRepository.save(industry);
    }

    @Transactional
    public Industry updateIndustryStatus(Long id, Integer enabled) {
        Industry industry = getIndustryById(id);
        industry.setEnabled(enabled == null ? 1 : enabled);
        return industryRepository.save(industry);
    }

    @Transactional
    public Industry moveIndustry(Long id, String direction) {
        List<Industry> current = new ArrayList<>(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT_ORDER, "asc"));
        int currentIndex = findIndexById(current, id);
        Industry target = current.get(currentIndex);
        int nextIndex = resolveTargetIndex(currentIndex, current.size(), direction);
        if (nextIndex == currentIndex) {
            persistIndustryOrder(current);
            return target;
        }
        Industry swap = current.get(nextIndex);
        current.set(currentIndex, swap);
        current.set(nextIndex, target);
        persistIndustryOrder(current);
        return current.stream().filter(item -> Objects.equals(item.getId(), id)).findFirst().orElse(target);
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

    private void normalizeAllSortOrders() {
        List<Industry> all = new ArrayList<>(industryRepository.findAllOrdered(IndustryRepository.SORT_BY_SORT_ORDER, "asc"));
        if (normalizeSortOrderForList(all)) {
            persistIndustryOrder(all);
        }
    }

    private boolean normalizeSortOrderForList(List<Industry> industries) {
        boolean changed = false;
        for (int i = 0; i < industries.size(); i++) {
            Industry industry = industries.get(i);
            if (industry.getSortOrder() == null || industry.getSortOrder() != i) {
                industry.setSortOrder(i);
                changed = true;
            }
        }
        return changed;
    }

    private void persistIndustryOrder(List<Industry> industries) {
        normalizeSortOrderForList(industries);
        for (int i = 0; i < industries.size(); i++) {
            Industry industry = industries.get(i);
            industryRepository.save(industry);
        }
    }
}
