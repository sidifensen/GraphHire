package com.graphhire.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.domain.model.SkillTag;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SkillTagMapper extends BaseMapper<SkillTag> {
}
