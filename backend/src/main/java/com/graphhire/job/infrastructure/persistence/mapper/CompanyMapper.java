package com.graphhire.job.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.job.infrastructure.persistence.po.CompanyPO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CompanyMapper extends BaseMapper<CompanyPO> {
}