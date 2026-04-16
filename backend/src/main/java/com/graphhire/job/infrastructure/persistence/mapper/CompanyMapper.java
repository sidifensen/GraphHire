package com.graphhire.job.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.job.infrastructure.persistence.po.CompanyPO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 企业MyBatis Mapper接口
 *
 * 【模块说明】继承BaseMapper，提供企业表的CRUD操作能力。
 * 【数据表】company
 */
@Mapper
public interface CompanyMapper extends BaseMapper<CompanyPO> {
}
