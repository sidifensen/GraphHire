package com.graphhire.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.domain.model.JobSkill;
import com.graphhire.domain.repository.JobSkillRepository;
import com.graphhire.infrastructure.persistence.mapper.JobSkillMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class JobSkillRepositoryImpl implements JobSkillRepository {
    private final JobSkillMapper jobSkillMapper;

    @Override
    public List<JobSkill> findByJobId(Long jobId) {
        return jobSkillMapper.selectList(new LambdaQueryWrapper<JobSkill>().eq(JobSkill::getJobId, jobId));
    }

    @Override
    public List<JobSkill> findBySkillTagId(Long skillTagId) {
        return jobSkillMapper.selectList(new LambdaQueryWrapper<JobSkill>().eq(JobSkill::getSkillTagId, skillTagId));
    }

    @Override
    public void save(JobSkill jobSkill) {
        jobSkillMapper.insert(jobSkill);
    }

    @Override
    public void deleteByJobId(Long jobId) {
        jobSkillMapper.delete(new LambdaQueryWrapper<JobSkill>().eq(JobSkill::getJobId, jobId));
    }

    @Override
    public void delete(Long id) {
        jobSkillMapper.deleteById(id);
    }
}
