package com.graphhire.admin.interface.dto.response;

/**
 * Dashboard statistics response DTO.
 */
public class DashboardStatsResponse {

    private long personCount;
    private long companyCount;
    private long resumeCount;
    private long jobCount;
    private long matchCount;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long personCount, long companyCount, long resumeCount, long jobCount, long matchCount) {
        this.personCount = personCount;
        this.companyCount = companyCount;
        this.resumeCount = resumeCount;
        this.jobCount = jobCount;
        this.matchCount = matchCount;
    }

    public long getPersonCount() {
        return personCount;
    }

    public void setPersonCount(long personCount) {
        this.personCount = personCount;
    }

    public long getCompanyCount() {
        return companyCount;
    }

    public void setCompanyCount(long companyCount) {
        this.companyCount = companyCount;
    }

    public long getResumeCount() {
        return resumeCount;
    }

    public void setResumeCount(long resumeCount) {
        this.resumeCount = resumeCount;
    }

    public long getJobCount() {
        return jobCount;
    }

    public void setJobCount(long jobCount) {
        this.jobCount = jobCount;
    }

    public long getMatchCount() {
        return matchCount;
    }

    public void setMatchCount(long matchCount) {
        this.matchCount = matchCount;
    }
}
