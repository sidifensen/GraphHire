package com.graphhire.admin.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.admin.infrastructure.persistence.po.AdminPO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 管理员数据访问层
 * 【模块说明】继承MyBatis-Plus BaseMapper，提供管理员数据的CRUD能力
 */
@Mapper
public interface AdminMapper extends BaseMapper<AdminPO> {
}