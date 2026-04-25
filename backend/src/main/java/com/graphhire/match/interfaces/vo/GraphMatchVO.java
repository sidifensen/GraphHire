package com.graphhire.match.interfaces.vo;

import java.util.List;

public class GraphMatchVO {

    private Long personId;
    private Long jobId;
    private Double totalScore;
    private Double skillScore;
    private Double requirementScore;
    private Double cityScore;
    private Double salaryScore;
    private Double educationScore;
    private String matchLevel;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private Double matchRate;
    private String reason;

    public GraphMatchVO() {
    }

    public GraphMatchVO(Long personId, Long jobId, Double totalScore, Double skillScore, Double requirementScore,
                        Double cityScore, Double salaryScore, Double educationScore, String matchLevel,
                        List<String> matchedSkills, List<String> missingSkills, Double matchRate, String reason) {
        this.personId = personId;
        this.jobId = jobId;
        this.totalScore = totalScore;
        this.skillScore = skillScore;
        this.requirementScore = requirementScore;
        this.cityScore = cityScore;
        this.salaryScore = salaryScore;
        this.educationScore = educationScore;
        this.matchLevel = matchLevel;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.matchRate = matchRate;
        this.reason = reason;
    }

    public Long getPersonId() { return personId; }
    public void setPersonId(Long personId) { this.personId = personId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Double getTotalScore() { return totalScore; }
    public void setTotalScore(Double totalScore) { this.totalScore = totalScore; }

    public Double getSkillScore() { return skillScore; }
    public void setSkillScore(Double skillScore) { this.skillScore = skillScore; }

    public Double getRequirementScore() { return requirementScore; }
    public void setRequirementScore(Double requirementScore) { this.requirementScore = requirementScore; }

    public Double getCityScore() { return cityScore; }
    public void setCityScore(Double cityScore) { this.cityScore = cityScore; }

    public Double getSalaryScore() { return salaryScore; }
    public void setSalaryScore(Double salaryScore) { this.salaryScore = salaryScore; }

    public Double getEducationScore() { return educationScore; }
    public void setEducationScore(Double educationScore) { this.educationScore = educationScore; }

    public String getMatchLevel() { return matchLevel; }
    public void setMatchLevel(String matchLevel) { this.matchLevel = matchLevel; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public Double getMatchRate() { return matchRate; }
    public void setMatchRate(Double matchRate) { this.matchRate = matchRate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
