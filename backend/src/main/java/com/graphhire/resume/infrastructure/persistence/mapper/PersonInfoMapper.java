package com.graphhire.resume.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.resume.infrastructure.persistence.po.PersonInfoPO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 人员信息持久化Mapper
 * 对应 person_profile 表的数据库操作
 */
@Mapper
public interface PersonInfoMapper extends BaseMapper<PersonInfoPO> {
}
