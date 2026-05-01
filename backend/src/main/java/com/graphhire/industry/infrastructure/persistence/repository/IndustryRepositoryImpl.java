package com.graphhire.industry.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.industry.domain.repository.IndustryRepository;
import com.graphhire.industry.infrastructure.persistence.mapper.IndustryMapper;
import com.graphhire.industry.infrastructure.persistence.po.IndustryPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class IndustryRepositoryImpl implements IndustryRepository {

    @Autowired
    private IndustryMapper industryMapper;

    @Override
    public Optional<Industry> findById(Long id) {
        return Optional.ofNullable(industryMapper.selectById(id)).map(this::toDomain);
    }

    @Override
    public Optional<Industry> findByName(String name) {
        LambdaQueryWrapper<IndustryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(IndustryPO::getName, name);
        return Optional.ofNullable(industryMapper.selectOne(wrapper)).map(this::toDomain);
    }

    @Override
    public List<Industry> findAll() {
        LambdaQueryWrapper<IndustryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(IndustryPO::getSortOrder, IndustryPO::getId);
        return industryMapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Industry> findByEnabled(Integer enabled) {
        LambdaQueryWrapper<IndustryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(IndustryPO::getEnabled, enabled)
               .orderByAsc(IndustryPO::getSortOrder, IndustryPO::getId);
        return industryMapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public Industry save(Industry industry) {
        IndustryPO po = toPO(industry);
        if (industry.getId() == null) {
            industryMapper.insert(po);
            industry.setId(po.getId());
        } else {
            industryMapper.updateById(po);
        }
        return industry;
    }

    private Industry toDomain(IndustryPO po) {
        Industry industry = new Industry();
        BeanUtil.copyProperties(po, industry);
        return industry;
    }

    private IndustryPO toPO(Industry industry) {
        IndustryPO po = new IndustryPO();
        BeanUtil.copyProperties(industry, po);
        return po;
    }
}
