package com.graphhire.notification.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.notification.infrastructure.persistence.po.NotificationPO;
import org.apache.ibatis.annotations.Mapper;

/**
 * 通知 MyBatis Mapper 接口
 * 继承 BaseMapper，提供基础的 CRUD 操作能力
 */
@Mapper
public interface NotificationMapper extends BaseMapper<NotificationPO> {
}