package com.graphhire.resume.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.resume.infrastructure.persistence.po.UploadTaskPO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 上传任务Mapper。
 * 说明：使用 MyBatis-Plus 提供 upload_task 基础 CRUD。
 */
@Mapper
public interface UploadTaskMapper extends BaseMapper<UploadTaskPO> {
}
