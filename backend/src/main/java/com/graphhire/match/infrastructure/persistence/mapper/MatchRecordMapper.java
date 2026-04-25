package com.graphhire.match.infrastructure.persistence.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.graphhire.match.infrastructure.persistence.po.MatchRecordPO;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;

@Mapper
public interface MatchRecordMapper extends BaseMapper<MatchRecordPO> {

    @Insert("""
            INSERT INTO match_record (resume_id, job_id, match_direction, match_score, skill_score, requirement_score)
            VALUES (#{resumeId}, #{jobId}, #{matchDirection}, #{overallScore}, #{skillScore}, #{requirementScore})
            """)
    int insertScores(@Param("resumeId") Long resumeId,
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
}
