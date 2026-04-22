package com.graphhire.job.infrastructure.persistence.repository;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;
import com.graphhire.job.infrastructure.persistence.mapper.JobMapper;
import com.graphhire.job.infrastructure.persistence.po.JobPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
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
        return jobMapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Job> findByStatus(JobStatus status) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getStatus, status.toCode());
        return jobMapper.selectList(wrapper).stream().map(this::toDomain).toList();
    }

    @Override
    public List<Job> findAll() {
        return jobMapper.selectList(null).stream().map(this::toDomain).toList();
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
        wrapper.eq(JobPO::getStatus, status.toCode());
        return jobMapper.selectCount(wrapper);
    }

    private Job toDomain(JobPO po) {
        if (po == null) {
            return null;
        }
        Job job = new Job();
        BeanUtil.copyProperties(po, job);
        job.setStatus(JobStatus.fromCode(po.getStatus()));
        if (po.getLocationCity() != null || po.getLocationDistrict() != null || po.getLocationDetail() != null) {
            job.setLocation(Location.of(po.getLocationCity(), po.getLocationDistrict(), po.getLocationDetail()));
        }
        if (po.getSalaryMin() != null || po.getSalaryMax() != null || po.getSalaryUnit() != null) {
            job.setSalaryRange(SalaryRange.of(po.getSalaryMin(), po.getSalaryMax(), po.getSalaryUnit()));
        } else {
            job.setSalaryRange(SalaryRange.empty());
        }
        if (job.getRequiredSkills() == null) {
            job.setRequiredSkills(new ArrayList<>());
        }
        if (job.getPreferredSkills() == null) {
            job.setPreferredSkills(new ArrayList<>());
        }
        return job;
    }

    private JobPO toPO(Job job) {
        JobPO po = new JobPO();
        BeanUtil.copyProperties(job, po);
        po.setStatus(job.getStatus().toCode());
        if (job.getLocation() != null) {
            po.setLocationCity(job.getLocation().getCity());
            po.setLocationDistrict(job.getLocation().getDistrict());
            po.setLocationDetail(job.getLocation().getDetailAddress());
        }
        if (job.getSalaryRange() != null) {
            po.setSalaryMin(job.getSalaryRange().getMin());
            po.setSalaryMax(job.getSalaryRange().getMax());
            po.setSalaryUnit(job.getSalaryRange().getUnit());
        }
        List<String> requiredSkills = job.getRequiredSkills();
        List<String> preferredSkills = job.getPreferredSkills();
        po.setRequiredSkills(requiredSkills != null ? String.join(",", requiredSkills) : null);
        po.setPreferredSkills(preferredSkills != null ? String.join(",", preferredSkills) : null);
        return po;
    }
}
