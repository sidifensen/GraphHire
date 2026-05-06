package com.graphhire.positiontype.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.positiontype.infrastructure.persistence.po.PositionTypePO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PositionTypeMapper extends BaseMapper<PositionTypePO> {}
