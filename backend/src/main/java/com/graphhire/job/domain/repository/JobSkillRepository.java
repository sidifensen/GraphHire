package com.graphhire.job.domain.repository;

import com.graphhire.job.domain.model.JobSkill;

import java.util.List;

/**
 * 职位技能关联仓储接口
 *
 * 【模块说明】定义职位与技能标签关联关系的持久化操作规范。
 */
public interface JobSkillRepository {
    /** 根据职位ID查询该职位关联的所有技能 */
    List<JobSkill> findByJobId(Long jobId);

    /** 根据技能标签ID查询关联该技能的所有职位 */
    List<JobSkill> findBySkillTagId(Long skillTagId);

    /** 保存职位技能关联（新增或更新） */
    JobSkill save(JobSkill jobSkill);

    /** 根据职位ID删除该职位关联的所有技能 */
    void deleteByJobId(Long jobId);
}
