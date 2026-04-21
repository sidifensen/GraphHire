package com.graphhire.job.interfaces.dto.response;

import java.util.ArrayList;
import java.util.List;

public class CompanyDashboardResponse {
    private long pendingApplicationCount;
    private long newMatchCandidateCount;
    private long activeJobCount;
    private List<CompanyDashboardJobItemResponse> recentJobs = new ArrayList<>();

    public long getPendingApplicationCount() {
        return pendingApplicationCount;
    }

    public void setPendingApplicationCount(long pendingApplicationCount) {
        this.pendingApplicationCount = pendingApplicationCount;
    }

    public long getNewMatchCandidateCount() {
        return newMatchCandidateCount;
    }

    public void setNewMatchCandidateCount(long newMatchCandidateCount) {
        this.newMatchCandidateCount = newMatchCandidateCount;
    }

    public long getActiveJobCount() {
        return activeJobCount;
    }

    public void setActiveJobCount(long activeJobCount) {
        this.activeJobCount = activeJobCount;
    }

    public List<CompanyDashboardJobItemResponse> getRecentJobs() {
        return recentJobs;
    }

    public void setRecentJobs(List<CompanyDashboardJobItemResponse> recentJobs) {
        this.recentJobs = recentJobs;
    }
}
