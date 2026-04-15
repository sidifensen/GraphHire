package com.graphhire.job.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.job.domain.model.JobSkill;
import com.graphhire.job.domain.repository.JobSkillRepository;
import com.graphhire.job.infrastructure.persistence.mapper.JobSkillMapper;
import com.graphhire.job.infrastructure.persistence.po.JobSkillPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class JobSkillRepositoryImpl implements JobSkillRepository {

    @Autowired
    private JobSkillMapper jobSkillMapper;

    @Override
    public List<JobSkill> findByJobId(Long jobId) {
        List<JobSkillPO> pos = jobSkillMapper.selectList(
            new LambdaQueryWrapper<JobSkillPO>().eq(JobSkillPO::getJobId, jobId));
        return pos.stream().map(this::toDomain).toList();
    }

    @Override
    public List<JobSkill> findBySkillTagId(Long skillTagId) {
        List<JobSkillPO> pos = jobSkillMapper.selectList(
            new LambdaQueryWrapper<JobSkillPO>().eq(JobSkillPO::getSkillTagId, skillTagId));
        return pos.stream().map(this::toDomain).toList();
    }

    @Override
    public JobSkill save(JobSkill jobSkill) {
        JobSkillPO po = toPO(jobSkill);
        if (jobSkill.getId() == null) {
            jobSkillMapper.insert(po);
            jobSkill.setId(po.getId());
        } else {
            jobSkillMapper.updateById(po);
        }
        return jobSkill;
    }

    @Override
    public void deleteByJobId(Long jobId) {
        jobSkillMapper.delete(new LambdaQueryWrapper<JobSkillPO>().eq(JobSkillPO::getJobId, jobId));
    }

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