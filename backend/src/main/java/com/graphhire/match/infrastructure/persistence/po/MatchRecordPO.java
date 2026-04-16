package com.graphhire.match.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 匹配记录持久化对象
 * 对应数据库 match_record 表，用于MyBatis-Plus CRUD操作
 */
@TableName("match_record")
public class MatchRecordPO {
    /** 主键自增ID */
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 关联简历ID */
    private Long resumeId;
    /** 关联职位ID */
    private Long jobId;
    /** 总分（加权平均分） */
    private BigDecimal overallScore;
    /** 技能匹配分数 */
    private BigDecimal skillScore;
    /** 经验匹配分数 */
    private BigDecimal experienceScore;
    /** 城市匹配分数 */
    private BigDecimal cityScore;
    /** 学历匹配分数 */
    private BigDecimal educationScore;
    /** 薪资匹配分数 */
    private BigDecimal salaryScore;
    /** 匹配报告（JSON格式，包含匹配原因、差距、建议等） */
    private String matchReport;
    /** 状态：0=未读，1=已读 */
    private Integer status;
    /** 创建时间 */
    @TableField("create_time")
    private LocalDateTime createTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public BigDecimal getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(BigDecimal overallScore) {
        this.overallScore = overallScore;
    }

    public BigDecimal getSkillScore() {
        return skillScore;
    }

    public void setSkillScore(BigDecimal skillScore) {
        this.skillScore = skillScore;
    }

    public BigDecimal getExperienceScore() {
        return experienceScore;
    }

    public void setExperienceScore(BigDecimal experienceScore) {
        this.experienceScore = experienceScore;
    }

    public BigDecimal getCityScore() {
        return cityScore;
    }

    public void setCityScore(BigDecimal cityScore) {
        this.cityScore = cityScore;
    }

    public BigDecimal getEducationScore() {
        return educationScore;
    }

    public void setEducationScore(BigDecimal educationScore) {
        this.educationScore = educationScore;
    }

    public BigDecimal getSalaryScore() {
        return salaryScore;
    }

    public void setSalaryScore(BigDecimal salaryScore) {
        this.salaryScore = salaryScore;
    }

    public String getMatchReport() {
        return matchReport;
    }

    public void setMatchReport(String matchReport) {
        this.matchReport = matchReport;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
}
