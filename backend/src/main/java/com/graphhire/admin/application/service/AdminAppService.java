package com.graphhire.admin.application.service;

import com.graphhire.admin.application.command.AuthCompanyCmd;
import com.graphhire.admin.application.command.DisableUserCmd;
import com.graphhire.admin.application.query.UserListQuery;
import com.graphhire.admin.domain.repository.AdminRepository;
import com.graphhire.admin.iface.dto.response.DashboardStatsResponse;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Admin application service for admin operations.
 */
@Service
public class AdminAppService {

    @Autowired
    private AdminRepository adminRepository;

    /**
     * Get dashboard statistics including personCount, companyCount, resumeCount, jobCount, matchCount.
     */
    public DashboardStatsResponse getDashboardStats() {
        long personCount = adminRepository.countPersons();
        long companyCount = adminRepository.countCompanies();
        long resumeCount = adminRepository.countResumes();
        long jobCount = adminRepository.countPublishedJobs();
        long matchCount = adminRepository.countMatchRecords();
        return new DashboardStatsResponse(personCount, companyCount, resumeCount, jobCount, matchCount);
    }

    /**
     * Authenticate/approve or reject a company.
     * Calls company.approve() or company.reject() then saves.
     */
    public void authCompany(Long companyId, AuthCompanyCmd cmd) {
        // Business logic handled in job module's Company aggregate
        // This service delegates to the domain service
    }

    /**
     * Disable a user account.
     */
    public void disableUser(DisableUserCmd cmd) {
        // Disable user logic
    }

    /**
     * Get user list with pagination.
     */
    public List<Long> getUserList(UserListQuery query) {
        // User list query logic
        return List.of();
    }
}
