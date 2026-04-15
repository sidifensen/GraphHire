package com.graphhire.match.infrastructure.persistence.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@TableName("match_record")
public class MatchRecordPO {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long resumeId;
    private Long jobId;
    private BigDecimal overallScore;
    private BigDecimal skillScore;
    private BigDecimal experienceScore;
    private BigDecimal cityScore;
    private BigDecimal educationScore;
    private BigDecimal salaryScore;
    private String matchReport;  // JSONB
    private Integer status;       // 0=pending, 1=viewed
    private LocalDateTime createdAt;

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
