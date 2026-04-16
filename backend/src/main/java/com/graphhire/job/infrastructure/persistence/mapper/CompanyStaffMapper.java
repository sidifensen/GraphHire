package com.graphhire.job.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.job.infrastructure.persistence.po.CompanyStaffPO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 企业员工MyBatis Mapper接口
 *
 * 【模块说明】继承BaseMapper，提供企业员工关联表的CRUD操作能力。
 * 【数据表】company_staff
 */
@Mapper
public interface CompanyStaffMapper extends BaseMapper<CompanyStaffPO> {
}
