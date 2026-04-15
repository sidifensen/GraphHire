package com.graphhire.web.dto.response;

import lombok.Data;

@Data
public class DashboardStatsResponse {
    private Long totalUsers;
    private Long totalPersons;
    private Long totalCompanies;
    private Long totalResumes;
    private Long totalJobs;
    private Long totalMatches;
    private Long pendingParseTasks;
    private Long pendingAuthCompanies;
}
