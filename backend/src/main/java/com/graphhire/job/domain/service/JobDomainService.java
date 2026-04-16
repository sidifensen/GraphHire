package com.graphhire.job.domain.service;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 职位领域服务
 *
 * 【模块说明】封装职位相关的领域业务逻辑，提供职位创建、状态校验、查询等核心方法。
 *
 * 【数据来源】
 * - JobRepository：职位仓储接口，负责数据持久化
 *
 * 【方法概览】
 * - createJob：创建新职位（草稿状态）
 * - canPublish：校验职位是否可发布
 * - canClose：校验职位是否可关闭
 * - findPublishedJobs：查询所有已发布职位
 * - findJobsByCompany：查询指定企业的所有职位
 */
@Service
public class JobDomainService {

    @Autowired
    private JobRepository jobRepository;

    /**
     * 创建职位
     * 【功能说明】创建新职位，初始状态为草稿。
     * 【业务步骤】
     * 步骤1：构建新职位实体，设置企业ID和基本信息
     * 步骤2：设置初始状态为DRAFT草稿
     */
    public Job createJob(Long companyId, String title, String department, Integer headcount,
                         String city, String district, String detailAddress,
                         Integer salaryMin, Integer salaryMax, String salaryUnit,
                         List<String> requiredSkills, List<String> preferredSkills,
                         String description) {
        // 步骤1：构建新职位实体
        Job job = new Job();
        job.setCompanyId(companyId);
        job.setTitle(title);
        job.setDepartment(department);
        job.setHeadcount(headcount);
        // 步骤2：设置初始状态为草稿
        job.setStatus(JobStatus.DRAFT);
        return job;
    }

    /**
     * 是否可以发布
     * 【功能说明】校验职位是否满足发布条件。
     * @param job 职位领域模型
     * @return true 表示可以发布，false 表示不能发布
     */
    public boolean canPublish(Job job) {
        return job.getStatus() == JobStatus.DRAFT || job.getStatus() == JobStatus.CLOSED;
    }

    /**
     * 是否可以关闭
     * 【功能说明】校验职位是否满足关闭条件。
     * @param job 职位领域模型
     * @return true 表示可以关闭，false 表示不能关闭
     */
    public boolean canClose(Job job) {
        return job.getStatus() == JobStatus.PUBLISHED;
    }

    /**
     * 查询已发布职位
     * 【功能说明】查询所有已发布的职位列表。
     * @return 已发布职位的列表
     */
    public List<Job> findPublishedJobs() {
        return jobRepository.findByStatus(JobStatus.PUBLISHED);
    }

    /**
     * 查询公司职位
     * 【功能说明】根据公司ID查询该公司的所有职位。
     * @param companyId 公司ID
     * @return 该公司的职位列表
     */
    public List<Job> findJobsByCompany(Long companyId) {
        return jobRepository.findByCompanyId(companyId);
    }
}
