package com.graphhire.auth.infrastructure.persistence.mapper;

import com.graphhire.auth.infrastructure.persistence.po.UserPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<UserPO> {
}