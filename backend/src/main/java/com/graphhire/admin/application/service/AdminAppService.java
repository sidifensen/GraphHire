package com.graphhire.admin.application.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.graphhire.admin.application.command.AuthCompanyCmd;
import com.graphhire.admin.application.command.DisableUserCmd;
import com.graphhire.admin.application.query.UserListQuery;
import com.graphhire.admin.domain.repository.AdminRepository;
import com.graphhire.admin.domain.service.AdminDomainService;
import com.graphhire.admin.interfaces.dto.response.AdminCompanyAuthItemResponse;
import com.graphhire.admin.interfaces.dto.response.AdminPageResponse;
import com.graphhire.admin.interfaces.dto.response.AdminSkillItemResponse;
import com.graphhire.admin.interfaces.dto.response.AdminTaskItemResponse;
import com.graphhire.admin.interfaces.dto.response.AdminTaskListResponse;
import com.graphhire.admin.interfaces.dto.response.AdminTaskSummaryResponse;
import com.graphhire.admin.interfaces.dto.response.AdminUserDetailResponse;
import com.graphhire.admin.interfaces.dto.response.AdminUserItemResponse;
import com.graphhire.admin.interfaces.dto.response.DashboardStatsResponse;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.common.vo.PageResult;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.notification.domain.model.Notification;
import com.graphhire.notification.domain.repository.NotificationRepository;
import com.graphhire.notification.domain.vo.NotificationType;
import com.graphhire.resume.application.service.ResumeAppService;
import com.graphhire.resume.domain.model.ParseTask;
import com.graphhire.resume.domain.repository.ParseTaskRepository;
import com.graphhire.skill.application.service.SkillTagAppService;
import com.graphhire.skill.application.command.CreateSkillTagCmd;
import com.graphhire.skill.domain.model.SkillTag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * 管理员应用服务
 * 【模块说明】提供管理员操作入口：仪表盘统计、企业认证审批、用户禁用、列表查询、任务重试等
 */
@Service
public class AdminAppService {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

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
    private PersonInfoRepository personInfoRepository;

    @Autowired
    private CompanyAppService companyAppService;

    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = adminRepository.countPersons();
        long totalCompanies = adminRepository.countCompanies();
        long totalResumes = adminRepository.countResumes();
        long totalJobs = adminRepository.countPublishedJobs();
        long matchCount = adminRepository.countMatchRecords();
        long pendingCompanyAudit = companyRepository.countByAuthStatus(AuthStatus.PENDING_VERIFY);

        List<ParseTask> tasks = parseTaskRepository.findAll();
        long pendingTaskCount = tasks.stream()
            .filter(task -> task.getStatus() == ParseTask.TaskStatus.PENDING || task.getStatus() == ParseTask.TaskStatus.RUNNING)
            .count();
        long failedTaskCount = tasks.stream()
            .filter(task -> task.getStatus() == ParseTask.TaskStatus.FAILED)
            .count();
        long completedTaskCount = tasks.stream()
            .filter(task -> task.getStatus() == ParseTask.TaskStatus.SUCCESS)
            .count();
        long totalTaskCount = tasks.size();

        DashboardStatsResponse response = new DashboardStatsResponse();
        response.setTotalUsers(totalUsers);
        response.setTotalCompanies(totalCompanies);
        response.setTotalResumes(totalResumes);
        response.setTotalJobs(totalJobs);
        response.setTodayNewUsers(0L);
        response.setTodayNewJobs(0L);
        response.setPendingCompanyAudit(pendingCompanyAudit);
        response.setPendingTaskCount(pendingTaskCount);
        response.setFailedTaskCount(failedTaskCount);
        response.setMatchCount(matchCount);
        response.setTaskSuccessRate(totalTaskCount == 0 ? 0D : completedTaskCount * 100.0 / totalTaskCount);
        response.setWeeklyNewCompanies(0L);
        response.setPendingSkillSuggestions(0L);
        response.setTrend(new ArrayList<>());
        return response;
    }

    @Transactional
    public void authCompany(Long companyId, AuthCompanyCmd cmd) {
        Optional<Company> companyOpt = companyRepository.findById(companyId);
        if (companyOpt.isEmpty()) {
            throw new RuntimeException("企业不存在");
        }

        Company company = companyOpt.get();
        adminDomainService.validateCompanyAuth(company, cmd.isApproved(), cmd.getReason());

        if (cmd.isApproved()) {
            company.approve();
        } else {
            company.reject();
        }

        companyRepository.save(company);

        Long userId = company.getId();
        String title = cmd.isApproved() ? "企业认证通过" : "企业认证拒绝";
        String content = adminDomainService.buildAuthNotificationText(company, cmd.isApproved(), cmd.getReason());
        Notification notification = new Notification(userId, NotificationType.SYSTEM_NOTIFICATION, title, content);
        notificationRepository.save(notification);
    }

    @Transactional
    public void disableUser(DisableUserCmd cmd) {
        Optional<User> userOpt = userRepository.findById(cmd.getUserId());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户不存在");
        }

        User user = userOpt.get();
        if (Boolean.TRUE.equals(cmd.getDisabled())) {
            user.setStatus(AuthStatus.DISABLED);
        } else {
            user.setStatus(AuthStatus.VERIFIED);
        }
        userRepository.save(user);
    }

    public AdminPageResponse<AdminUserItemResponse> getUserList(UserListQuery query) {
        IPage<User> page = adminRepository.findUsersPage(query.getPage(), query.getPageSize());
        List<AdminUserItemResponse> list = page.getRecords().stream()
            .filter(user -> matchesUser(user, query))
            .map(this::toAdminUserItem)
            .toList();
        return new AdminPageResponse<>(list, page.getTotal(), query.getPage(), query.getPageSize());
    }

    @Transactional
    public void modifyUserStatus(Long userId, String status) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户不存在");
        }
        User user = userOpt.get();
        user.setStatus(mapUserStatus(status));
        userRepository.save(user);
    }

    public AdminUserDetailResponse getUserDetail(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户不存在");
        }
        User user = userOpt.get();

        AdminUserDetailResponse response = new AdminUserDetailResponse();

        // 构建用户基本信息
        AdminUserDetailResponse.UserItem userItem = new AdminUserDetailResponse.UserItem();
        String username = user.getUsername() == null ? null : user.getUsername().getValue();
        userItem.setId(user.getId());
        userItem.setUsername(username);
        userItem.setEmail(username);
        userItem.setPhone(null);
        userItem.setType(user.getUserType() == null ? null : user.getUserType().name());
        userItem.setStatus(mapFrontendStatus(user.getStatus()));
        userItem.setCreatedAt(null);
        userItem.setLastLoginAt(null);
        response.setUser(userItem);

        // 构建个人信息
        Optional<PersonInfo> personInfoOpt = personInfoRepository.findByUserId(userId);
        if (personInfoOpt.isPresent()) {
            PersonInfo personInfo = personInfoOpt.get();
            AdminUserDetailResponse.PersonInfoDetail personInfoDetail = new AdminUserDetailResponse.PersonInfoDetail();
            personInfoDetail.setId(personInfo.getId());
            personInfoDetail.setUserId(personInfo.getUserId());
            personInfoDetail.setRealName(personInfo.getRealName());
            personInfoDetail.setGender(personInfo.getGender());
            personInfoDetail.setAge(personInfo.getAge());
            personInfoDetail.setPhone(personInfo.getPhone());
            personInfoDetail.setEmail(null);
            personInfoDetail.setEducation(personInfo.getEducation());
            personInfoDetail.setCity(personInfo.getCity());
            personInfoDetail.setTargetCity(personInfo.getTargetCity());
            personInfoDetail.setExpectedSalary(personInfo.getExpectedSalary());
            response.setPersonInfo(personInfoDetail);
        } else {
            response.setPersonInfo(null);
        }

        return response;
    }

    public PageResult<?> getResumeList(int page, int size) {
        return resumeAppService.getList(page, size);
    }

    public PageResult<Job> getJobList(int page, int size) {
        List<Job> allJobs = jobRepository.findAll();
        int start = Math.max((page - 1) * size, 0);
        int end = Math.min(start + size, allJobs.size());
        List<Job> pageJobs = start < allJobs.size() ? allJobs.subList(start, end) : new ArrayList<>();
        return new PageResult<>(pageJobs, (long) allJobs.size(), page, size);
    }

    public AdminPageResponse<AdminSkillItemResponse> getSkillList(String category, String keyword, int page, int pageSize) {
        List<AdminSkillItemResponse> list = skillTagAppService.getAllSkillTags().stream()
            .filter(skill -> matchesSkill(skill, category, keyword))
            .map(this::toAdminSkillItem)
            .toList();
        return paginateList(list, page, pageSize);
    }

    @Transactional
    public SkillTag createSkillTag(com.graphhire.admin.interfaces.dto.request.AdminSkillTagUpsertRequest request) {
        CreateSkillTagCmd cmd = new CreateSkillTagCmd();
        cmd.setName(request.getName());
        cmd.setDescription(request.getDescription());
        SkillTag created = skillTagAppService.createSkillTag(cmd);
        if (request.getSynonyms() != null) {
            for (String synonym : request.getSynonyms()) {
                skillTagAppService.addSynonym(created.getId(), synonym);
            }
            created = skillTagAppService.getSkillTagById(created.getId());
        }
        return created;
    }

    @Transactional
    public SkillTag updateSkillTag(Long id, com.graphhire.admin.interfaces.dto.request.AdminSkillTagUpsertRequest request) {
        CreateSkillTagCmd cmd = new CreateSkillTagCmd();
        cmd.setName(request.getName());
        cmd.setDescription(request.getDescription());
        SkillTag updated = skillTagAppService.updateSkillTag(id, cmd);
        if (request.getSynonyms() != null) {
            updated.getSynonyms().clear();
            for (String synonym : request.getSynonyms()) {
                updated.addSynonym(synonym);
            }
            updated = skillTagAppService.updateSkillTag(id, cmd);
            for (String synonym : updated.getSynonyms()) {
                skillTagAppService.removeSynonym(id, synonym);
            }
            for (String synonym : request.getSynonyms()) {
                skillTagAppService.addSynonym(id, synonym);
            }
            updated = skillTagAppService.getSkillTagById(id);
        }
        return updated;
    }

    @Transactional
    public void deleteSkillTag(Long id) {
        skillTagAppService.deleteSkillTag(id);
    }

    @Transactional
    public SkillTag addSkillTagSynonym(Long id, String synonym) {
        skillTagAppService.addSynonym(id, synonym);
        return skillTagAppService.getSkillTagById(id);
    }

    @Transactional
    public void removeSkillTagSynonym(Long id, String synonym) {
        skillTagAppService.removeSynonym(id, synonym);
    }

    public AdminTaskListResponse getTaskList(String type, String status, int page, int pageSize) {
        IPage<ParseTask> taskPage = parseTaskRepository.findPage(type, status, page, pageSize);
        AdminTaskSummaryResponse summary = new AdminTaskSummaryResponse();
        summary.setPending(parseTaskRepository.countByStatus(ParseTask.TaskStatus.PENDING));
        summary.setProcessing(parseTaskRepository.countByStatus(ParseTask.TaskStatus.RUNNING));
        summary.setCompleted(parseTaskRepository.countByStatus(ParseTask.TaskStatus.SUCCESS));
        summary.setFailed(parseTaskRepository.countByStatus(ParseTask.TaskStatus.FAILED));

        List<AdminTaskItemResponse> items = taskPage.getRecords().stream()
            .map(this::toAdminTaskItem)
            .toList();

        AdminTaskListResponse response = new AdminTaskListResponse();
        response.setSummary(summary);
        response.setList(items);
        response.setTotal(taskPage.getTotal());
        response.setPage(page);
        response.setPageSize(pageSize);
        return response;
    }

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
    }

    public AdminPageResponse<AdminCompanyAuthItemResponse> getCompanyAuthList(String status, String keyword, int page, int pageSize) {
        List<Company> companies = loadCompaniesByStatus(status);
        List<AdminCompanyAuthItemResponse> list = companies.stream()
            .filter(company -> matchesCompany(company, keyword))
            .map(this::toAdminCompanyAuthItem)
            .toList();
        return paginateList(list, page, pageSize);
    }

    @Transactional
    public void approveCompany(Long id) {
        companyAppService.approveCompany(id);
    }

    @Transactional
    public void rejectCompany(Long id) {
        companyAppService.rejectCompany(id);
    }

    public List<Company> getPendingCompanies() {
        return companyAppService.getPendingCompanies();
    }

    public List<Company> getCompaniesByAuthStatus(Integer authStatus) {
        return companyAppService.getCompaniesByAuthStatus(AuthStatus.values()[authStatus]);
    }

    @Transactional
    public void batchApproveCompany(List<Long> ids) {
        for (Long id : ids) {
            companyAppService.approveCompany(id);
        }
    }

    @Transactional
    public void batchRejectCompany(List<Long> ids, String reason) {
        for (Long id : ids) {
            companyAppService.rejectCompany(id);
        }
    }

    @Transactional
    public void batchRejectCompany(List<Long> ids) {
        batchRejectCompany(ids, null);
    }

    @Transactional
    public void batchDisableUser(List<Long> userIds) {
        for (Long userId : userIds) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setStatus(AuthStatus.DISABLED);
                userRepository.save(user);
            }
        }
    }

    @Transactional
    public void batchRetryTask(List<Long> taskIds) {
        for (Long taskId : taskIds) {
            Optional<ParseTask> taskOpt = parseTaskRepository.findById(taskId);
            if (taskOpt.isPresent()) {
                ParseTask task = taskOpt.get();
                if (task.getStatus() == ParseTask.TaskStatus.FAILED) {
                    task.setStatus(ParseTask.TaskStatus.PENDING);
                    task.setErrorMessage(null);
                    parseTaskRepository.save(task);
                }
            }
        }
    }

    private boolean matchesUser(User user, UserListQuery query) {
        if (query.getUserType() != null && user.getUserType() != null && !query.getUserType().equalsIgnoreCase(user.getUserType().name())) {
            return false;
        }
        if (query.getStatus() != null && !mapFrontendStatus(user.getStatus()).equalsIgnoreCase(query.getStatus())) {
            return false;
        }
        if (query.getKeyword() == null || query.getKeyword().isBlank()) {
            return true;
        }
        String keyword = query.getKeyword().toLowerCase();
        String username = user.getUsername() == null ? "" : user.getUsername().getValue();
        return username.toLowerCase().contains(keyword);
    }

    private boolean matchesSkill(SkillTag skill, String category, String keyword) {
        // 技能分类字段已下线，保留参数但不再按分类过滤
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String lowered = keyword.toLowerCase();
        return (skill.getName() != null && skill.getName().toLowerCase().contains(lowered))
            || skill.getSynonyms().stream().anyMatch(synonym -> synonym.toLowerCase().contains(lowered));
    }

    private boolean matchesTask(ParseTask task, String type, String status) {
        if (type != null && !type.isBlank() && !mapTaskType(task.getTaskType()).equalsIgnoreCase(type)) {
            return false;
        }
        if (status != null && !status.isBlank() && !mapTaskStatus(task.getStatus()).equalsIgnoreCase(status)) {
            return false;
        }
        return true;
    }

    private boolean matchesCompany(Company company, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String lowered = keyword.toLowerCase();
        return (company.getName() != null && company.getName().toLowerCase().contains(lowered))
            || (company.getUnifiedSocialCreditCode() != null && company.getUnifiedSocialCreditCode().toLowerCase().contains(lowered));
    }

    private List<Company> loadCompaniesByStatus(String status) {
        if (status == null || status.isBlank()) {
            List<Company> list = new ArrayList<>();
            list.addAll(companyRepository.findByAuthStatus(AuthStatus.PENDING_VERIFY));
            list.addAll(companyRepository.findByAuthStatus(AuthStatus.VERIFIED));
            list.addAll(companyRepository.findByAuthStatus(AuthStatus.REJECTED));
            return list;
        }
        return switch (status.toUpperCase()) {
            case "APPROVED" -> companyRepository.findByAuthStatus(AuthStatus.VERIFIED);
            case "REJECTED" -> companyRepository.findByAuthStatus(AuthStatus.REJECTED);
            case "PENDING" -> companyRepository.findByAuthStatus(AuthStatus.PENDING_VERIFY);
            default -> new ArrayList<>();
        };
    }

    private AdminCompanyAuthItemResponse toAdminCompanyAuthItem(Company company) {
        AdminCompanyAuthItemResponse item = new AdminCompanyAuthItemResponse();
        item.setId(company.getId());
        item.setCompanyId(company.getId());
        item.setCompanyName(company.getName());
        item.setUnifiedSocialCreditCode(company.getUnifiedSocialCreditCode());
        item.setIndustry(company.getIndustry());
        item.setScale(company.getScale());
        item.setAddress(company.getAddress());
        item.setContact(company.getContactName());
        item.setLegalPerson(company.getContactName());
        item.setPhone(company.getContactPhone());
        item.setBusinessLicenseUrl(company.getLicenseUrl());
        item.setSubmittedAt(formatDateTime(company.getCreateTime()));
        item.setStatus(mapCompanyStatus(company.getAuthStatus()));
        item.setReviewedAt(formatDateTime(company.getUpdatedAt()));
        item.setReviewerId(null);
        item.setRejectReason(null);
        return item;
    }

    private AdminUserItemResponse toAdminUserItem(User user) {
        AdminUserItemResponse item = new AdminUserItemResponse();
        String username = user.getUsername() == null ? null : user.getUsername().getValue();
        item.setId(user.getId());
        item.setUsername(username);
        item.setEmail(username);
        item.setPhone(null);
        item.setType(user.getUserType() == null ? null : user.getUserType().name());
        item.setStatus(mapFrontendStatus(user.getStatus()));
        item.setCreatedAt(formatDateTime(user.getCreateTime()));
        item.setLastLoginAt(formatDateTime(user.getLastLoginTime()));
        item.setAvatarUrl(null);
        // 查询 realName
        Optional<PersonInfo> personInfoOpt = personInfoRepository.findByUserId(user.getId());
        String realName = personInfoOpt.map(PersonInfo::getRealName).orElse(null);
        item.setRealName(realName);
        return item;
    }

    private AdminSkillItemResponse toAdminSkillItem(SkillTag skill) {
        AdminSkillItemResponse item = new AdminSkillItemResponse();
        item.setId(skill.getId());
        item.setName(skill.getName());
        item.setCategory(null);
        item.setSynonyms(new ArrayList<>(skill.getSynonyms()));
        item.setJobCount(skill.getUsageCount() == null ? 0 : skill.getUsageCount());
        return item;
    }

    private AdminTaskItemResponse toAdminTaskItem(ParseTask task) {
        AdminTaskItemResponse item = new AdminTaskItemResponse();
        item.setId(task.getId());
        item.setSourceId(task.getSourceId() == null ? task.getResumeId() : task.getSourceId());
        item.setType(mapTaskType(task.getTaskType()));
        item.setStatus(mapTaskStatus(task.getStatus()));
        item.setProgress(task.getStatus() == ParseTask.TaskStatus.SUCCESS ? 100 : task.getStatus() == ParseTask.TaskStatus.RUNNING ? 50 : 0);
        item.setTotal(100);
        item.setSuccessCount(task.getStatus() == ParseTask.TaskStatus.SUCCESS ? 1 : 0);
        item.setFailCount(task.getStatus() == ParseTask.TaskStatus.FAILED ? 1 : 0);
        item.setCreatedAt(format(task.getCreatedAt()));
        item.setStartedAt(format(task.getStartedAt()));
        item.setCompletedAt(format(task.getCompletedAt()));
        item.setUpdatedAt(format(task.getUpdatedAt()));
        item.setErrorMessage(task.getErrorMessage());
        return item;
    }

    private String mapCompanyStatus(AuthStatus status) {
        if (status == null) {
            return "PENDING";
        }
        return switch (status) {
            case VERIFIED -> "APPROVED";
            case REJECTED -> "REJECTED";
            default -> "PENDING";
        };
    }

    private String mapFrontendStatus(AuthStatus status) {
        if (status == null) {
            return "ACTIVE";
        }
        return switch (status) {
            case DISABLED -> "DISABLED";
            case LOCKED -> "LOCKED";
            default -> "ACTIVE";
        };
    }

    private AuthStatus mapUserStatus(String status) {
        if (status == null) {
            return AuthStatus.VERIFIED;
        }
        return switch (status.toUpperCase()) {
            case "DISABLED" -> AuthStatus.DISABLED;
            case "LOCKED" -> AuthStatus.LOCKED;
            default -> AuthStatus.VERIFIED;
        };
    }

    private String mapTaskType(String rawType) {
        return "RESUME_PARSE";
    }

    private String mapTaskStatus(ParseTask.TaskStatus status) {
        if (status == null) {
            return "QUEUED";
        }
        return switch (status) {
            case PENDING -> "QUEUED";
            case RUNNING -> "PROCESSING";
            case SUCCESS -> "COMPLETED";
            case FAILED -> "FAILED";
        };
    }

    private String format(LocalDateTime time) {
        return time == null ? null : time.format(DATE_TIME_FORMATTER);
    }

    private String formatDateTime(LocalDateTime time) {
        return time == null ? null : time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    private <T> AdminPageResponse<T> paginateList(List<T> list, int page, int pageSize) {
        int start = Math.max((page - 1) * pageSize, 0);
        int end = Math.min(start + pageSize, list.size());
        List<T> pageList = start < list.size() ? list.subList(start, end) : new ArrayList<>();
        return new AdminPageResponse<>(pageList, list.size(), page, pageSize);
    }
}
