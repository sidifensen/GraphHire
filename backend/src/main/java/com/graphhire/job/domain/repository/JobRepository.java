package com.graphhire.job.domain.repository;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.vo.JobStatus;

import java.util.List;
import java.util.Optional;

/**
 * 职位仓储接口
 *
 * 【模块说明】定义职位数据的持久化操作规范，提供按ID、状态、企业查询等核心方法。
 */
public interface JobRepository {
    /** 根据ID查询职位 */
    Optional<Job> findById(Long id);

    /** 根据企业ID查询该企业下所有职位 */
    List<Job> findByCompanyId(Long companyId);

    /** 根据状态查询职位列表 */
    List<Job> findByStatus(JobStatus status);

    /** 查询所有职位 */
    List<Job> findAll();

    /** 保存职位（新增或更新） */
    Job save(Job job);

    /** 删除职位 */
    void delete(Job job);

    /** 根据状态统计职位数量 */
    long countByStatus(JobStatus status);
}
