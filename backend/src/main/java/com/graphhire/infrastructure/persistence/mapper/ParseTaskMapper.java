package com.graphhire.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.domain.model.ParseTask;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ParseTaskMapper extends BaseMapper<ParseTask> {
}
