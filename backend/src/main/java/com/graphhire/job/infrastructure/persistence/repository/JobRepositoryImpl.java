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

/**
 * 职位仓储实现
 *
 * 【模块说明】提供职位数据的持久化操作，包括 CRUD 和状态管理。
 *
 * 【数据来源】job 表
 *
 * 【方法概览】
 * - findById：根据ID查询职位
 * - findByCompanyId：根据公司ID查询职位列表
 * - findByStatus：根据状态查询职位
 * - findAll：查询所有职位
 * - save：保存职位
 * - delete：删除职位
 * - countByStatus：统计各状态职位数量
 */
@Repository
public class JobRepositoryImpl implements JobRepository {

    @Autowired
    private JobMapper jobMapper;

    @Override
    /** 根据ID查询职位 */
    public Optional<Job> findById(Long id) {
        JobPO po = jobMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    /** 根据公司ID查询职位列表 */
    public List<Job> findByCompanyId(Long companyId) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getCompanyId, companyId);
        return jobMapper.selectList(wrapper).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    /** 根据状态查询职位 */
    public List<Job> findByStatus(JobStatus status) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getStatus, status.name());
        return jobMapper.selectList(wrapper).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    /** 查询所有职位 */
    public List<Job> findAll() {
        return jobMapper.selectList(null).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    /** 保存职位 */
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
    /** 删除职位 */
    public void delete(Job job) {
        if (job.getId() != null) {
            jobMapper.deleteById(job.getId());
        }
    }

    @Override
    /** 统计各状态职位数量 */
    public long countByStatus(JobStatus status) {
        LambdaQueryWrapper<JobPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobPO::getStatus, status.name());
        return jobMapper.selectCount(wrapper);
    }

    /** PO 转 Domain */
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

    /** Domain 转 PO */
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
