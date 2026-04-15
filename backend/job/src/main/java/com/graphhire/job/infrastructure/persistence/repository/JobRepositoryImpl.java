package com.graphhire.job.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.infrastructure.persistence.mapper.JobMapper;
import com.graphhire.job.infrastructure.persistence.po.JobPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JobRepositoryImpl implements JobRepository {

    @Autowired
    private JobMapper jobMapper;

    @Override
    public Optional<Job> findById(Long id) {
        JobPO po = jobMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<Job> findByCompanyId(Long companyId) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getCompanyId, companyId);
        return jobMapper.selectList(wrapper).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<Job> findByStatus(JobStatus status) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getStatus, status.name());
        return jobMapper.selectList(wrapper).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Job save(Job job) {
        JobPO po = toPO(job);
        if (job.getId() == null) {
            jobMapper.insert(po);
            job.setId(po.getId());
        } else {
            jobMapper.updateById(po);
        }
        return job;
    }

    @Override
    public void delete(Job job) {
        if (job.getId() != null) {
            jobMapper.deleteById(job.getId());
        }
    }

    @Override
    public long countByStatus(JobStatus status) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getStatus, status.name());
        return jobMapper.selectCount(wrapper);
    }

    private Job toDomain(JobPO po) {
        if (po == null) return null;
        Job job = new Job();
        job.setId(po.getId());
        job.setCompanyId(po.getCompanyId());
        job.setTitle(po.getTitle());
        job.setDepartment(po.getDepartment());
        job.setHeadcount(po.getHeadcount());
        job.setDescription(po.getDescription());
        job.setStatus(JobStatus.valueOf(po.getStatus()));
        return job;
    }

    private JobPO toPO(Job job) {
        JobPO po = new JobPO();
        po.setId(job.getId());
        po.setCompanyId(job.getCompanyId());
        po.setTitle(job.getTitle());
        po.setDepartment(job.getDepartment());
        po.setHeadcount(job.getHeadcount());
        po.setDescription(job.getDescription());
        po.setStatus(job.getStatus().name());
        return po;
    }
}
