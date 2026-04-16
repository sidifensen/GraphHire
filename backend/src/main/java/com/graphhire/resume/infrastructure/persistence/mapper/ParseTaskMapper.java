package com.graphhire.resume.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.resume.infrastructure.persistence.po.ParseTaskPO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 解析任务持久化Mapper
 * 对应 parse_task 表的数据库操作
 */
@Mapper
public interface ParseTaskMapper extends BaseMapper<ParseTaskPO> {
}
