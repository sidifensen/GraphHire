package com.graphhire.domain.repository;

import com.graphhire.domain.model.JobSkill;

import java.util.List;

public interface JobSkillRepository {
    List<JobSkill> findByJobId(Long jobId);
    List<JobSkill> findBySkillTagId(Long skillTagId);
    void save(JobSkill jobSkill);
    void deleteByJobId(Long jobId);
    void delete(Long id);
}
