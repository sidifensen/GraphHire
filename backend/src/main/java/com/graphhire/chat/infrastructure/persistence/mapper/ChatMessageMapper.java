package com.graphhire.chat.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.chat.infrastructure.persistence.po.ChatMessagePO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ChatMessageMapper extends BaseMapper<ChatMessagePO> {
    @Update("UPDATE chat_message SET ext = CAST(#{extJson} AS jsonb), update_time = CURRENT_TIMESTAMP WHERE id = #{id}")
    void updateExtById(@Param("id") Long id, @Param("extJson") String extJson);
}
