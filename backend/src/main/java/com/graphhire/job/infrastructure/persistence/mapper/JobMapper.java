package com.graphhire.job.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.job.infrastructure.persistence.po.JobPO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 职位MyBatis Mapper接口
 *
 * 【模块说明】继承BaseMapper，提供职位表的CRUD操作能力。
 * 【数据表】job
 */
@Mapper
public interface JobMapper extends BaseMapper<JobPO> {
}
