package com.graphhire.job.domain.repository;

import com.graphhire.job.domain.model.JobSkill;

import java.util.List;

public interface JobSkillRepository {
    List<JobSkill> findByJobId(Long jobId);
    List<JobSkill> findBySkillTagId(Long skillTagId);
    JobSkill save(JobSkill jobSkill);
    void deleteByJobId(Long jobId);
}