package com.graphhire.match.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 匹配记录持久化对象
 * 对应数据库 match_record 表，用于MyBatis-Plus CRUD操作
 */
@TableName(value = "match_record", autoResultMap = true)
public class MatchRecordPO {
    /** 主键自增ID */
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 关联简历ID */
    @TableField("resume_id")
    private Long resumeId;
    /** 关联职位ID */
    @TableField("job_id")
    private Long jobId;
    /** 匹配方向：1=简历→职位 2=职位→简历 */
    @TableField("match_direction")
    private Integer matchDirection;
    /** 总分（加权平均分） */
    @TableField("match_score")
    private BigDecimal overallScore;
    /** 技能匹配分数 */
    @TableField("skill_score")
    private BigDecimal skillScore;
    /** 经验匹配分数 */
    @TableField("exp_score")
    private BigDecimal experienceScore;
    /** 城市匹配分数 */
    @TableField("city_score")
    private BigDecimal cityScore;
    /** 学历匹配分数 */
    @TableField("edu_score")
    private BigDecimal educationScore;
    /** 薪资匹配分数 */
    @TableField("salary_score")
    private BigDecimal salaryScore;
    /** 匹配报告（JSON格式，包含匹配原因、差距、建议等） */
    @TableField(value = "match_detail", typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> matchReport;
    /** 状态：0=未读，1=已读 */
    @TableField("viewed")
    private Integer viewed;
    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;
    /** 更新时间 */
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

    public BigDecimal getExperienceScore() { return experienceScore; }
    public void setExperienceScore(BigDecimal experienceScore) { this.experienceScore = experienceScore; }

    public BigDecimal getCityScore() { return cityScore; }
    public void setCityScore(BigDecimal cityScore) { this.cityScore = cityScore; }

    public BigDecimal getEducationScore() { return educationScore; }
    public void setEducationScore(BigDecimal educationScore) { this.educationScore = educationScore; }

    public BigDecimal getSalaryScore() { return salaryScore; }
    public void setSalaryScore(BigDecimal salaryScore) { this.salaryScore = salaryScore; }

    public Map<String, Object> getMatchReport() { return matchReport; }
    public void setMatchReport(Map<String, Object> matchReport) { this.matchReport = matchReport; }

    public Integer getViewed() { return viewed; }
    public void setViewed(Integer viewed) { this.viewed = viewed; }

    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }

    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
