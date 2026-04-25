package com.graphhire.match.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@TableName(value = "match_record", autoResultMap = true)
public class MatchRecordPO {
    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("resume_id")
    private Long resumeId;

    @TableField("job_id")
    private Long jobId;

    @TableField("match_direction")
    private Integer matchDirection;

    @TableField("match_score")
    private BigDecimal overallScore;

    @TableField("skill_score")
    private BigDecimal skillScore;

    @TableField("requirement_score")
    private BigDecimal requirementScore;

    @TableField("create_time")
    private LocalDateTime createTime;

    @TableField("update_time")
    private LocalDateTime updateTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Integer getMatchDirection() { return matchDirection; }
    public void setMatchDirection(Integer matchDirection) { this.matchDirection = matchDirection; }

    public BigDecimal getOverallScore() { return overallScore; }
    public void setOverallScore(BigDecimal overallScore) { this.overallScore = overallScore; }

    public BigDecimal getSkillScore() { return skillScore; }
    public void setSkillScore(BigDecimal skillScore) { this.skillScore = skillScore; }

    public BigDecimal getRequirementScore() { return requirementScore; }
    public void setRequirementScore(BigDecimal requirementScore) { this.requirementScore = requirementScore; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
