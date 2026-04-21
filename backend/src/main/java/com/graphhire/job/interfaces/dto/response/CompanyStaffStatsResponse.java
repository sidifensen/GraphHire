package com.graphhire.job.interfaces.dto.response;

public class CompanyStaffStatsResponse {
    private long totalCount;
    private long ownerCount;
    private long hrCount;
    private long recruiterCount;

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }

    public long getOwnerCount() {
        return ownerCount;
    }

    public void setOwnerCount(long ownerCount) {
        this.ownerCount = ownerCount;
    }

    public long getHrCount() {
        return hrCount;
    }

    public void setHrCount(long hrCount) {
        this.hrCount = hrCount;
    }

    public long getRecruiterCount() {
        return recruiterCount;
    }

    public void setRecruiterCount(long recruiterCount) {
        this.recruiterCount = recruiterCount;
    }
}
