package com.graphhire.industry.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.industry.infrastructure.persistence.po.IndustryPO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface IndustryMapper extends BaseMapper<IndustryPO> {
}
