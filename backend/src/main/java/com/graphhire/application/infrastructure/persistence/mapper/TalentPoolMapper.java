package com.graphhire.application.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.application.infrastructure.persistence.po.TalentPoolPO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TalentPoolMapper extends BaseMapper<TalentPoolPO> {
}
