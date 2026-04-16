package com.graphhire.resume.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.resume.infrastructure.persistence.po.ResumePO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 简历持久化Mapper
 * 对应 resume 表的数据库操作
 */
@Mapper
public interface ResumeMapper extends BaseMapper<ResumePO> {
}
