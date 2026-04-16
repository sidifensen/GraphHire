package com.graphhire.job.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.job.domain.model.JobSkill;
import com.graphhire.job.domain.repository.JobSkillRepository;
import com.graphhire.job.infrastructure.persistence.mapper.JobSkillMapper;
import com.graphhire.job.infrastructure.persistence.po.JobSkillPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 职位技能关联仓储实现
 *
 * 【模块说明】实现JobSkillRepository接口，负责职位与技能关联数据的数据库持久化操作。
 * 【数据来源】job_skill表（通过JobSkillMapper操作）
 *
 * 【方法概览】
 * - findByJobId：根据职位ID查询技能关联列表
 * - findBySkillTagId：根据技能标签ID查询关联职位列表
 * - save：保存技能关联（新增或更新）
 * - deleteByJobId：根据职位ID删除所有关联记录
 */
@Repository
public class JobSkillRepositoryImpl implements JobSkillRepository {

    @Autowired
    private JobSkillMapper jobSkillMapper;

    /**
     * 根据职位ID查询技能标签关联
     */
    @Override
    public List<JobSkill> findByJobId(Long jobId) {
        // 根据职位ID查询关联的技能列表
        List<JobSkillPO> pos = jobSkillMapper.selectList(
            new LambdaQueryWrapper<JobSkillPO>().eq(JobSkillPO::getJobId, jobId));
        return pos.stream().map(this::toDomain).toList();
    }

    /**
     * 根据技能标签ID查询职位关联
     */
    @Override
    public List<JobSkill> findBySkillTagId(Long skillTagId) {
        // 根据技能标签ID查询关联的职位列表（用于反向查询）
        List<JobSkillPO> pos = jobSkillMapper.selectList(
            new LambdaQueryWrapper<JobSkillPO>().eq(JobSkillPO::getSkillTagId, skillTagId));
        return pos.stream().map(this::toDomain).toList();
    }

    /**
     * 保存职位技能标签关联
     */
    @Override
    public JobSkill save(JobSkill jobSkill) {
        // 转换为PO后执行新增或更新
        JobSkillPO po = toPO(jobSkill);
        if (jobSkill.getId() == null) {
            // 新增：插入后回填ID
            jobSkillMapper.insert(po);
            jobSkill.setId(po.getId());
        } else {
            // 更新：根据ID更新
            jobSkillMapper.updateById(po);
        }
        return jobSkill;
    }

    /**
     * 根据职位ID删除技能标签关联
     */
    @Override
    public void deleteByJobId(Long jobId) {
        // 根据职位ID删除所有关联记录（用于更新前的清理）
        jobSkillMapper.delete(new LambdaQueryWrapper<JobSkillPO>().eq(JobSkillPO::getJobId, jobId));
    }

    /** PO转Domain领域模型 */
    private JobSkill toDomain(JobSkillPO po) {
        if (po == null) return null;
        JobSkill jobSkill = new JobSkill();
        jobSkill.setId(po.getId());
        jobSkill.setJobId(po.getJobId());
        jobSkill.setSkillTagId(po.getSkillTagId());
        jobSkill.setIsRequired(po.getIsRequired());
        jobSkill.setWeight(po.getWeight());
        return jobSkill;
    }

    /** Domain转PO持久化对象 */
    private JobSkillPO toPO(JobSkill jobSkill) {
        JobSkillPO po = new JobSkillPO();
        po.setId(jobSkill.getId());
        po.setJobId(jobSkill.getJobId());
        po.setSkillTagId(jobSkill.getSkillTagId());
        po.setIsRequired(jobSkill.getIsRequired());
        po.setWeight(jobSkill.getWeight());
        return po;
    }
}
