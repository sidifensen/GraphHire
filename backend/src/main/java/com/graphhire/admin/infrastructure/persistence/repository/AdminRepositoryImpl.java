package com.graphhire.admin.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.admin.domain.repository.AdminRepository;
import com.graphhire.admin.infrastructure.persistence.mapper.AdminMapper;
import com.graphhire.job.infrastructure.persistence.mapper.JobMapper;
import com.graphhire.match.infrastructure.persistence.mapper.MatchRecordMapper;
import com.graphhire.resume.infrastructure.persistence.mapper.ResumeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class AdminRepositoryImpl implements AdminRepository {

    @Autowired
    private AdminMapper adminMapper;

    @Autowired
    private ResumeMapper resumeMapper;

    @Autowired
    private JobMapper jobMapper;

    @Autowired
    private MatchRecordMapper matchRecordMapper;

    @Override
    public long countPersons() {
        LambdaQueryWrapper<com.graphhire.admin.infrastructure.persistence.po.AdminPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(com.graphhire.admin.infrastructure.persistence.po.AdminPO::getUserType, 1);
        return adminMapper.selectCount(wrapper);
    }

    @Override
    public long countCompanies() {
        LambdaQueryWrapper<com.graphhire.admin.infrastructure.persistence.po.AdminPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(com.graphhire.admin.infrastructure.persistence.po.AdminPO::getUserType, 2);
        return adminMapper.selectCount(wrapper);
    }

    @Override
    public long countResumes() {
        return resumeMapper.selectCount(null);
    }

    @Override
    public long countPublishedJobs() {
        LambdaQueryWrapper<com.graphhire.job.infrastructure.persistence.po.JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(com.graphhire.job.infrastructure.persistence.po.JobPO::getStatus, "PUBLISHED");
        return jobMapper.selectCount(wrapper);
    }

    @Override
    public long countMatchRecords() {
        return matchRecordMapper.selectCount(null);
    }

    @Override
    public Optional<Long> findUserIdById(Long id) {
        return Optional.of(id);
    }
}