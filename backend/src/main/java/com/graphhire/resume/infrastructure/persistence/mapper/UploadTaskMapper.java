package com.graphhire.resume.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.resume.infrastructure.persistence.po.UploadTaskPO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UploadTaskMapper extends BaseMapper<UploadTaskPO> {
}
