package com.graphhire.resume.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.resume.infrastructure.persistence.po.ResumePO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/**
 * 简历持久化Mapper
 * 对应 resume 表的数据库操作
 */
@Mapper
public interface ResumeMapper extends BaseMapper<ResumePO> {

    /**
     * 同步 resume 主键序列，防止序列值落后导致主键冲突
     */
    @Select("SELECT setval('resume_id_seq', COALESCE((SELECT MAX(id) FROM resume), 1), true)")
    Long syncResumeIdSequence();

    /**
     * 更新简历解析结果（jsonb类型）
     * 使用CAST将字符串转为jsonb
     */
    @Update("UPDATE resume SET parse_result = CAST(#{jsonStr} AS jsonb), parse_status = #{parseStatus} WHERE id = #{id} AND deleted = 0")
    int updateParseResult(@Param("id") Long id, @Param("jsonStr") String jsonStr, @Param("parseStatus") Integer parseStatus);
}
