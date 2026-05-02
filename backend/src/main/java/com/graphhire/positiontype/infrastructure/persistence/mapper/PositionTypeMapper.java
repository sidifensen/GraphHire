package com.graphhire.positiontype.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.positiontype.infrastructure.persistence.po.PositionTypePO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface PositionTypeMapper extends BaseMapper<PositionTypePO> {
    @Select("SELECT COALESCE(MAX(code), 0) + 1 FROM position_type")
    Long nextCode();
}

