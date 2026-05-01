package com.graphhire.industry.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.industry.domain.repository.IndustryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class IndustryAppService {

    @Autowired
    private IndustryRepository industryRepository;

    public List<Industry> listIndustries(Integer enabled) {
        if (enabled == null) {
            return industryRepository.findAll();
        }
        return industryRepository.findByEnabled(enabled);
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
        Industry industry = new Industry();
        industry.setName(name);
        industry.setEnabled(enabled == null ? 1 : enabled);
        industry.setSortOrder(sortOrder == null ? 0 : sortOrder);
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
}
