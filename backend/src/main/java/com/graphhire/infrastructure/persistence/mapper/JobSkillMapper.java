package com.graphhire.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.domain.model.JobSkill;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface JobSkillMapper extends BaseMapper<JobSkill> {
}
