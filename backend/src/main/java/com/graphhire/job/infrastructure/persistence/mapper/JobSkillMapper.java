package com.graphhire.job.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.job.infrastructure.persistence.po.JobSkillPO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 职位技能关联MyBatis Mapper接口
 *
 * 【模块说明】继承BaseMapper，提供职位技能关联表的CRUD操作能力。
 * 【数据表】job_skill
 */
@Mapper
public interface JobSkillMapper extends BaseMapper<JobSkillPO> {
}
