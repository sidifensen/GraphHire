package com.graphhire.match.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.match.infrastructure.persistence.po.MatchRecordPO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MatchRecordMapper extends BaseMapper<MatchRecordPO> {
}
