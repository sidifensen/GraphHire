package com.graphhire.resume.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.resume.infrastructure.persistence.po.PersonInfoPO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PersonInfoMapper extends BaseMapper<PersonInfoPO> {
}
