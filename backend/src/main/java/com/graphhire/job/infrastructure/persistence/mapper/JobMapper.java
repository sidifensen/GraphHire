package com.graphhire.job.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.job.infrastructure.persistence.po.JobPO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface JobMapper extends BaseMapper<JobPO> {
}
