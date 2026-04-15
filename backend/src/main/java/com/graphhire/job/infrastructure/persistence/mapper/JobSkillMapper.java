package com.graphhire.job.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.job.infrastructure.persistence.po.JobSkillPO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface JobSkillMapper extends BaseMapper<JobSkillPO> {
}