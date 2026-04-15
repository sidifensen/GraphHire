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
    private BigDecimal totalScore;
    private BigDecimal skillScore;
    private BigDecimal expScore;
    private BigDecimal cityScore;
    private BigDecimal eduScore;
    private BigDecimal salScore;
    private String level;
    private String matchReason;
    private Boolean isRead;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

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

    public BigDecimal getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(BigDecimal totalScore) {
        this.totalScore = totalScore;
    }

    public BigDecimal getSkillScore() {
        return skillScore;
    }

    public void setSkillScore(BigDecimal skillScore) {
        this.skillScore = skillScore;
    }

    public BigDecimal getExpScore() {
        return expScore;
    }

    public void setExpScore(BigDecimal expScore) {
        this.expScore = expScore;
    }

    public BigDecimal getCityScore() {
        return cityScore;
    }

    public void setCityScore(BigDecimal cityScore) {
        this.cityScore = cityScore;
    }

    public BigDecimal getEduScore() {
        return eduScore;
    }

    public void setEduScore(BigDecimal eduScore) {
        this.eduScore = eduScore;
    }

    public BigDecimal getSalScore() {
        return salScore;
    }

    public void setSalScore(BigDecimal salScore) {
        this.salScore = salScore;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
}
