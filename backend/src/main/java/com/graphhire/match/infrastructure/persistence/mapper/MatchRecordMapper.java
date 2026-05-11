package com.graphhire.match.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.match.infrastructure.persistence.po.MatchRecordPO;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Mapper
public interface MatchRecordMapper extends BaseMapper<MatchRecordPO> {

    @Insert("""
            INSERT INTO match_record (resume_id, job_id, match_direction, match_score, skill_score, requirement_score)
            VALUES (#{resumeId}, #{jobId}, #{matchDirection}, #{overallScore}, #{skillScore}, #{requirementScore})
            ON CONFLICT (resume_id, job_id, match_direction)
            DO UPDATE SET
                match_score = EXCLUDED.match_score,
                skill_score = EXCLUDED.skill_score,
                requirement_score = EXCLUDED.requirement_score,
                update_time = CURRENT_TIMESTAMP
            """)
    int upsertScores(@Param("resumeId") Long resumeId,
                     @Param("jobId") Long jobId,
                     @Param("matchDirection") Integer matchDirection,
                     @Param("overallScore") BigDecimal overallScore,
                     @Param("skillScore") BigDecimal skillScore,
                     @Param("requirementScore") BigDecimal requirementScore);

    @Update("""
            UPDATE match_record SET
            match_direction = #{matchDirection},
            match_score = #{overallScore},
            skill_score = #{skillScore},
            requirement_score = #{requirementScore}
            WHERE id = #{id}
            """)
    int updateScores(@Param("id") Long id,
                     @Param("matchDirection") Integer matchDirection,
                     @Param("overallScore") BigDecimal overallScore,
                     @Param("skillScore") BigDecimal skillScore,
                     @Param("requirementScore") BigDecimal requirementScore);

    @Delete("DELETE FROM match_record WHERE resume_id = #{resumeId}")
    int deleteByResumeId(@Param("resumeId") Long resumeId);

    @Delete("DELETE FROM match_record WHERE job_id = #{jobId}")
    int deleteByJobId(@Param("jobId") Long jobId);

    /**
     * 按职位集合聚合匹配数量。
     * 说明：企业端列表需要按岗位展示匹配数，批量聚合可避免逐岗位查询。
     */
    @Select("""
        <script>
        SELECT job_id AS jobId, COUNT(1) AS matchCount
        FROM match_record
        WHERE job_id IN
        <foreach collection="jobIds" item="jobId" open="(" separator="," close=")">
            #{jobId}
        </foreach>
        GROUP BY job_id
        </script>
        """)
    List<Map<String, Object>> countByJobIds(@Param("jobIds") List<Long> jobIds);
}
