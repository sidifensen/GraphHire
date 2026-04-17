package com.graphhire.application.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.application.domain.model.TalentPool;
import com.graphhire.application.domain.repository.TalentPoolRepository;
import com.graphhire.application.infrastructure.persistence.mapper.TalentPoolMapper;
import com.graphhire.application.infrastructure.persistence.po.TalentPoolPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class TalentPoolRepositoryImpl implements TalentPoolRepository {

    @Autowired
    private TalentPoolMapper talentPoolMapper;

    @Override
    public TalentPool save(TalentPool talentPool) {
        TalentPoolPO po = toPO(talentPool);
        if (talentPool.getId() == null) {
            talentPoolMapper.insert(po);
            talentPool.setId(po.getId());
        } else {
            talentPoolMapper.updateById(po);
        }
        return talentPool;
    }

    @Override
    public Optional<TalentPool> findById(Long id) {
        TalentPoolPO po = talentPoolMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<TalentPool> findByCompanyId(Long companyId) {
        LambdaQueryWrapper<TalentPoolPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TalentPoolPO::getCompanyId, companyId)
                .orderByDesc(TalentPoolPO::getAddedAt);
        return talentPoolMapper.selectList(wrapper).stream()
                .map(this::toDomain).toList();
    }

    @Override
    public Optional<TalentPool> findByCompanyIdAndResumeId(Long companyId, Long resumeId) {
        LambdaQueryWrapper<TalentPoolPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TalentPoolPO::getCompanyId, companyId)
                .eq(TalentPoolPO::getResumeId, resumeId);
        TalentPoolPO po = talentPoolMapper.selectOne(wrapper);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public boolean existsByCompanyIdAndResumeId(Long companyId, Long resumeId) {
        LambdaQueryWrapper<TalentPoolPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TalentPoolPO::getCompanyId, companyId)
                .eq(TalentPoolPO::getResumeId, resumeId);
        return talentPoolMapper.selectCount(wrapper) > 0;
    }

    @Override
    public void delete(Long id) {
        talentPoolMapper.deleteById(id);
    }

    @Override
    public void deleteByCompanyIdAndResumeId(Long companyId, Long resumeId) {
        LambdaQueryWrapper<TalentPoolPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TalentPoolPO::getCompanyId, companyId)
                .eq(TalentPoolPO::getResumeId, resumeId);
        talentPoolMapper.delete(wrapper);
    }

    private TalentPool toDomain(TalentPoolPO po) {
        if (po == null) return null;
        TalentPool tp = new TalentPool();
        BeanUtil.copyProperties(po, tp);
        if (po.getStatus() != null) {
            tp.setStatus(TalentPool.TalentPoolStatus.valueOf(po.getStatus()));
        }
        return tp;
    }

    private TalentPoolPO toPO(TalentPool talentPool) {
        if (talentPool == null) return null;
        TalentPoolPO po = new TalentPoolPO();
        BeanUtil.copyProperties(talentPool, po);
        if (talentPool.getStatus() != null) {
            po.setStatus(talentPool.getStatus().name());
        }
        return po;
    }
}
