package com.graphhire.match.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.match.infrastructure.persistence.po.MatchRecordPO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 匹配记录MyBatis Mapper接口
 * 继承BaseMapper，提供基础的CRUD操作
 */
@Mapper
public interface MatchRecordMapper extends BaseMapper<MatchRecordPO> {
}
