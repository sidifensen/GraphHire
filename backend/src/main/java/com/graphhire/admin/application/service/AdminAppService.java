package com.graphhire.admin.application.service;

import com.graphhire.admin.application.command.AuthCompanyCmd;
import com.graphhire.admin.application.command.DisableUserCmd;
import com.graphhire.admin.application.query.UserListQuery;
import com.graphhire.admin.domain.repository.AdminRepository;
import com.graphhire.admin.domain.service.AdminDomainService;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.admin.iface.dto.response.DashboardStatsResponse;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Admin application service for admin operations.
 */
@Service
public class AdminAppService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminDomainService adminDomainService;

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
    @Transactional
    public void authCompany(Long companyId, AuthCompanyCmd cmd) {
        // Get company from repository
        Optional<Company> companyOpt = companyRepository.findById(companyId);
        if (companyOpt.isEmpty()) {
            throw new RuntimeException("企业不存在");
        }

        Company company = companyOpt.get();

        // Validate the auth operation
        adminDomainService.validateCompanyAuth(company, cmd.isApproved(), cmd.getReason());

        // Perform auth action
        if (cmd.isApproved()) {
            company.approve();
        } else {
            company.reject();
        }

        // Save company
        companyRepository.save(company);

        // Create notification for company user
        // Note: Company model doesn't have userId field, using company.id as userId for notification
        Long userId = company.getId(); // Using company.id as the user identifier
        String title = cmd.isApproved() ? "企业认证通过" : "企业认证拒绝";
        String content = adminDomainService.buildAuthNotificationText(company, cmd.isApproved(), cmd.getReason());

        Notification notification = new Notification(userId, NotificationType.SYSTEM_NOTIFICATION, title, content);
        notificationRepository.save(notification);
    }

    /**
     * Disable a user account.
     */
    @Transactional
    public void disableUser(DisableUserCmd cmd) {
        // Get user from repository
        Optional<User> userOpt = userRepository.findById(cmd.getUserId());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户不存在");
        }

        User user = userOpt.get();

        // Set user status based on disabled flag
        if (Boolean.TRUE.equals(cmd.getDisabled())) {
            user.setStatus(AuthStatus.DISABLED);
        } else {
            user.setStatus(AuthStatus.VERIFIED);
        }

        // Save user
        userRepository.save(user);
    }

    /**
     * Get user list with pagination.
     */
    public List<Long> getUserList(UserListQuery query) {
        // TODO: Implement with AdminMapper for complex pagination query with filters
        // For now, return empty list as AdminMapper doesn't exist yet
        // When implemented, should use AdminMapper to select users with pagination
        // and return list of user IDs
        return new ArrayList<>();
    }
}
