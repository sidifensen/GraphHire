package com.graphhire.admin.application.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.graphhire.admin.application.command.AuthCompanyCmd;
import com.graphhire.admin.application.command.DisableUserCmd;
import com.graphhire.admin.application.query.UserListQuery;
import com.graphhire.admin.domain.repository.AdminRepository;
import com.graphhire.admin.domain.service.AdminDomainService;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.common.vo.PageResult;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.admin.interfaces.dto.response.DashboardStatsResponse;
import com.graphhire.resume.application.service.ResumeAppService;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.skill.application.service.SkillTagAppService;
import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.job.application.service.CompanyAppService;
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

    @Autowired
    private ResumeAppService resumeAppService;

    @Autowired
    private ParseTaskRepository parseTaskRepository;

    @Autowired
    private SkillTagAppService skillTagAppService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CompanyAppService companyAppService;

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
        // Get paginated users from repository
        IPage<User> page = adminRepository.findUsersPage(query.getPage(), query.getPageSize());
        return page.getRecords().stream()
            .map(User::getId)
            .toList();
    }

    /**
     * Modify user status (enable/disable).
     */
    @Transactional
    public void modifyUserStatus(Long userId, boolean enabled) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户不存在");
        }
        User user = userOpt.get();
        user.setStatus(enabled ? AuthStatus.VERIFIED : AuthStatus.DISABLED);
        userRepository.save(user);
    }

    /**
     * Get resume list with pagination (admin).
     */
    public PageResult<?> getResumeList(int page, int size) {
        return resumeAppService.getList(page, size);
    }

    /**
     * Get job list with pagination (admin).
     */
    public PageResult<Job> getJobList(int page, int size) {
        // For now, return all jobs as a simple implementation
        // In production, would add pagination to JobRepository
        List<Job> allJobs = jobRepository.findAll();
        int start = (page - 1) * size;
        int end = Math.min(start + size, allJobs.size());
        List<Job> pageJobs = start < allJobs.size() ? allJobs.subList(start, end) : new ArrayList<>();
        return new PageResult<>(pageJobs, (long) allJobs.size(), page, size);
    }

    /**
     * Get skill tag list (admin).
     */
    public List<SkillTag> getSkillList() {
        return skillTagAppService.getAllSkillTags();
    }

    /**
     * Get parse task list with pagination (admin).
     */
    public PageResult<ParseTask> getTaskList(int page, int size) {
        // Simple implementation - return all tasks
        // In production, would add pagination to ParseTaskRepository
        List<ParseTask> allTasks = parseTaskRepository.findAll();
        int start = (page - 1) * size;
        int end = Math.min(start + size, allTasks.size());
        List<ParseTask> pageTasks = start < allTasks.size() ? allTasks.subList(start, end) : new ArrayList<>();
        return new PageResult<>(pageTasks, (long) allTasks.size(), page, size);
    }

    /**
     * Retry a failed parse task.
     */
    @Transactional
    public void retryTask(Long taskId) {
        Optional<ParseTask> taskOpt = parseTaskRepository.findById(taskId);
        if (taskOpt.isEmpty()) {
            throw new RuntimeException("任务不存在");
        }
        ParseTask task = taskOpt.get();
        if (task.getStatus() != ParseTask.TaskStatus.FAILED) {
            throw new RuntimeException("只能重试失败的任务");
        }
        task.setStatus(ParseTask.TaskStatus.PENDING);
        task.setErrorMessage(null);
        parseTaskRepository.save(task);
        // TODO: Send MQ message to re-trigger parsing
    }

    /**
     * Get company auth list (pending companies).
     */
    public List<Company> getCompanyAuthList() {
        return companyAppService.getPendingCompanies();
    }
}
