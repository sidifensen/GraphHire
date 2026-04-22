package com.graphhire.match.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.match.infrastructure.persistence.po.MatchRecordPO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

/**
 * 匹配记录MyBatis Mapper接口
 * 继承BaseMapper，提供基础的CRUD操作
 */
@Mapper
public interface MatchRecordMapper extends BaseMapper<MatchRecordPO> {

    /**
     * 插入匹配记录（处理JSONB类型）
     */
    @Insert("<script>" +
            "INSERT INTO match_record (resume_id, job_id, match_direction, match_score, skill_score, " +
            "exp_score, city_score, edu_score, salary_score, match_detail, viewed) " +
            "VALUES (#{resumeId}, #{jobId}, #{matchDirection}, #{overallScore}, #{skillScore}, " +
            "#{experienceScore}, #{cityScore}, #{educationScore}, #{salaryScore}, " +
            "#{matchDetail}::jsonb, #{viewed})" +
            "</script>")
    int insertWithJsonb(@Param("resumeId") Long resumeId,
                        @Param("jobId") Long jobId,
                        @Param("matchDirection") Integer matchDirection,
                        @Param("overallScore") java.math.BigDecimal overallScore,
                        @Param("skillScore") java.math.BigDecimal skillScore,
                        @Param("experienceScore") java.math.BigDecimal experienceScore,
                        @Param("cityScore") java.math.BigDecimal cityScore,
                        @Param("educationScore") java.math.BigDecimal educationScore,
                        @Param("salaryScore") java.math.BigDecimal salaryScore,
                        @Param("matchDetail") String matchDetail,
                        @Param("viewed") Integer viewed);

    /**
     * 更新匹配记录（处理JSONB类型）
     */
    @Update("<script>" +
            "UPDATE match_record SET " +
            "match_direction = #{matchDirection}, " +
            "match_score = #{overallScore}, " +
            "skill_score = #{skillScore}, " +
            "exp_score = #{experienceScore}, " +
            "city_score = #{cityScore}, " +
            "edu_score = #{educationScore}, " +
            "salary_score = #{salaryScore}, " +
            "match_detail = #{matchDetail}::jsonb, " +
            "viewed = #{viewed} " +
            "WHERE id = #{id}" +
            "</script>")
    int updateWithJsonb(@Param("id") Long id,
                        @Param("matchDirection") Integer matchDirection,
                        @Param("overallScore") java.math.BigDecimal overallScore,
                        @Param("skillScore") java.math.BigDecimal skillScore,
                        @Param("experienceScore") java.math.BigDecimal experienceScore,
                        @Param("cityScore") java.math.BigDecimal cityScore,
                        @Param("educationScore") java.math.BigDecimal educationScore,
                        @Param("salaryScore") java.math.BigDecimal salaryScore,
                        @Param("matchDetail") String matchDetail,
                        @Param("viewed") Integer viewed);
}
