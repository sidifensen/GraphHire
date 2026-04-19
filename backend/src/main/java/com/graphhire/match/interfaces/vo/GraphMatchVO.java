package com.graphhire.match.interfaces.vo;

import java.util.List;

/**
 * 技能图谱匹配结果值对象
 * 返回人岗技能匹配的详细信息
 */
public class GraphMatchVO {

    /** 用户ID */
    private Long personId;
    /** 职位ID */
    private Long jobId;
    /** 匹配总分 (0-100) */
    private Double totalScore;
    /** 匹配等级：HIGH/MEDIUM/LOW */
    private String matchLevel;
    /** 匹配的技能列表 */
    private List<String> matchedSkills;
    /** 缺失的技能列表 */
    private List<String> missingSkills;
    /** 技能匹配率百分比 */
    private Double matchRate;
    /** 匹配原因说明 */
    private String reason;

    public GraphMatchVO() {
    }

    public GraphMatchVO(Long personId, Long jobId, Double totalScore, String matchLevel,
                        List<String> matchedSkills, List<String> missingSkills,
                        Double matchRate, String reason) {
        this.personId = personId;
        this.jobId = jobId;
        this.totalScore = totalScore;
        this.matchLevel = matchLevel;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.matchRate = matchRate;
        this.reason = reason;
    }

    public Long getPersonId() {
        return personId;
    }

    public void setPersonId(Long personId) {
        this.personId = personId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public Double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Double totalScore) {
        this.totalScore = totalScore;
    }

    public String getMatchLevel() {
        return matchLevel;
    }

    public void setMatchLevel(String matchLevel) {
        this.matchLevel = matchLevel;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public Double getMatchRate() {
        return matchRate;
    }

    public void setMatchRate(Double matchRate) {
        this.matchRate = matchRate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
