package com.graphhire.application.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.application.domain.model.Application;
import com.graphhire.application.domain.model.ApplicationStatus;
import com.graphhire.application.domain.repository.ApplicationRepository;
import com.graphhire.application.infrastructure.persistence.mapper.ApplicationMapper;
import com.graphhire.application.infrastructure.persistence.po.ApplicationPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ApplicationRepositoryImpl implements ApplicationRepository {

    @Autowired
    private ApplicationMapper applicationMapper;

    @Override
    public Application save(Application application) {
        ApplicationPO po = toPO(application);
        if (application.getId() == null) {
            applicationMapper.insert(po);
            application.setId(po.getId());
        } else {
            applicationMapper.updateById(po);
        }
        return application;
    }

    @Override
    public Optional<Application> findById(Long id) {
        ApplicationPO po = applicationMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<Application> findByUserId(Long userId) {
        LambdaQueryWrapper<ApplicationPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ApplicationPO::getUserId, userId)
                .orderByDesc(ApplicationPO::getAppliedAt);
        return applicationMapper.selectList(wrapper).stream()
                .map(this::toDomain).toList();
    }

    @Override
    public List<Application> findByJobId(Long jobId) {
        LambdaQueryWrapper<ApplicationPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ApplicationPO::getJobId, jobId)
                .orderByDesc(ApplicationPO::getAppliedAt);
        return applicationMapper.selectList(wrapper).stream()
                .map(this::toDomain).toList();
    }

    @Override
    public List<Application> findByCompanyId(Long companyId) {
        LambdaQueryWrapper<ApplicationPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ApplicationPO::getCompanyId, companyId)
                .orderByDesc(ApplicationPO::getAppliedAt);
        return applicationMapper.selectList(wrapper).stream()
                .map(this::toDomain).toList();
    }

    @Override
    public List<Application> findByCompanyIdAndStatus(Long companyId, ApplicationStatus status) {
        LambdaQueryWrapper<ApplicationPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ApplicationPO::getCompanyId, companyId)
                .eq(ApplicationPO::getStatus, status.name())
                .orderByDesc(ApplicationPO::getAppliedAt);
        return applicationMapper.selectList(wrapper).stream()
                .map(this::toDomain).toList();
    }

    @Override
    public Optional<Application> findByResumeIdAndJobId(Long resumeId, Long jobId) {
        LambdaQueryWrapper<ApplicationPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ApplicationPO::getResumeId, resumeId)
                .eq(ApplicationPO::getJobId, jobId);
        ApplicationPO po = applicationMapper.selectOne(wrapper);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public boolean existsByResumeIdAndJobId(Long resumeId, Long jobId) {
        LambdaQueryWrapper<ApplicationPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ApplicationPO::getResumeId, resumeId)
                .eq(ApplicationPO::getJobId, jobId);
        return applicationMapper.selectCount(wrapper) > 0;
    }

    @Override
    public void delete(Long id) {
        applicationMapper.deleteById(id);
    }

    private Application toDomain(ApplicationPO po) {
        if (po == null) return null;
        Application app = new Application();
        BeanUtil.copyProperties(po, app);
        if (po.getStatus() != null) {
            app.setStatus(ApplicationStatus.valueOf(po.getStatus()));
        }
        return app;
    }

    private ApplicationPO toPO(Application application) {
        if (application == null) return null;
        ApplicationPO po = new ApplicationPO();
        BeanUtil.copyProperties(application, po);
        if (application.getStatus() != null) {
            po.setStatus(application.getStatus().name());
        }
        return po;
    }
}
