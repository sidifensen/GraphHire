package com.graphhire.auth.infrastructure.persistence.mapper;

import com.graphhire.auth.infrastructure.persistence.po.UserPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户 MyBatis Mapper 接口
 * 继承 MyBatis-Plus BaseMapper，提供通用的数据库操作能力
 */
@Mapper
public interface UserMapper extends BaseMapper<UserPO> {
}