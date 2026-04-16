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
 * 管理员应用服务
 * 【模块说明】提供管理员操作入口：仪表盘统计、企业认证审批、用户禁用、列表查询、任务重试等
 */
@Service
public class AdminAppService {

    /** 管理员仓储 */
    @Autowired
    private AdminRepository adminRepository;

    /** 企业仓储 */
    @Autowired
    private CompanyRepository companyRepository;

    /** 通知仓储 */
    @Autowired
    private NotificationRepository notificationRepository;

    /** 用户仓储 */
    @Autowired
    private UserRepository userRepository;

    /** 管理员领域服务 */
    @Autowired
    private AdminDomainService adminDomainService;

    /** 简历应用服务 */
    @Autowired
    private ResumeAppService resumeAppService;

    /** 解析任务仓储 */
    @Autowired
    private ParseTaskRepository parseTaskRepository;

    /** 技能标签应用服务 */
    @Autowired
    private SkillTagAppService skillTagAppService;

    /** 职位仓储 */
    @Autowired
    private JobRepository jobRepository;

    /** 企业应用服务 */
    @Autowired
    private CompanyAppService companyAppService;

    /**
     * 获取仪表盘统计数据
     * 【功能说明】统计平台各项关键数据：用户数、企业数、简历数、职位数、匹配记录数
     * @return DashboardStatsResponse 包含personCount、companyCount、resumeCount、jobCount、matchCount的统计数据
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
     * 企业认证审批/拒绝
     * 【功能说明】审核企业资质，调用company.approve()或company.reject()后保存
     * 【业务步骤】
     * 步骤1：从仓库获取企业，不存在则抛异常
     * 步骤2：校验认证操作参数
     * 步骤3：执行认证操作（通过/拒绝）
     * 步骤4：保存企业
     * 步骤5：创建通知消息
     * @param companyId 企业ID
     * @param cmd 认证操作命令（包含审批结果和原因）
     * @return void
     */
    @Transactional
    public void authCompany(Long companyId, AuthCompanyCmd cmd) {
        // 步骤1：从仓库获取企业
        Optional<Company> companyOpt = companyRepository.findById(companyId);
        if (companyOpt.isEmpty()) {
            throw new RuntimeException("企业不存在");
        }

        Company company = companyOpt.get();

        // 步骤2：校验认证操作参数
        adminDomainService.validateCompanyAuth(company, cmd.isApproved(), cmd.getReason());

        // 步骤3：执行认证操作
        if (cmd.isApproved()) {
            company.approve();
        } else {
            company.reject();
        }

        // 步骤4：保存企业
        companyRepository.save(company);

        // 步骤5：创建通知消息
        // 注意：Company模型没有userId字段，使用company.id作为userId
        Long userId = company.getId(); // 使用company.id作为用户标识
        String title = cmd.isApproved() ? "企业认证通过" : "企业认证拒绝";
        String content = adminDomainService.buildAuthNotificationText(company, cmd.isApproved(), cmd.getReason());

        Notification notification = new Notification(userId, NotificationType.SYSTEM_NOTIFICATION, title, content);
        notificationRepository.save(notification);
    }

    /**
     * 禁用用户账号
     * 【功能说明】管理员禁用或启用用户账号
     * 【业务步骤】
     * 步骤1：从仓库获取用户，不存在则抛异常
     * 步骤2：根据disabled标志设置用户状态
     * 步骤3：保存用户
     * @param cmd 禁用用户命令（包含用户ID和禁用标志）
     * @return void
     */
    @Transactional
    public void disableUser(DisableUserCmd cmd) {
        // 步骤1：从仓库获取用户
        Optional<User> userOpt = userRepository.findById(cmd.getUserId());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("用户不存在");
        }

        User user = userOpt.get();

        // 步骤2：根据disabled标志设置用户状态
        if (Boolean.TRUE.equals(cmd.getDisabled())) {
            user.setStatus(AuthStatus.DISABLED);
        } else {
            user.setStatus(AuthStatus.VERIFIED);
        }

        // 步骤3：保存用户
        userRepository.save(user);
    }

    /**
     * 分页获取用户列表
     * 【功能说明】管理员分页查询平台注册用户
     * @param query 分页查询参数（包含页码和每页大小）
     * @return List<Long> 用户ID列表
     */
    public List<Long> getUserList(UserListQuery query) {
        // 从仓库获取分页用户
        IPage<User> page = adminRepository.findUsersPage(query.getPage(), query.getPageSize());
        return page.getRecords().stream()
            .map(User::getId)
            .toList();
    }

    /**
     * 修改用户状态（启用/禁用）
     * 【功能说明】管理员修改用户账号状态为启用或禁用
     * @param userId 用户ID
     * @param enabled 是否启用（true启用，false禁用）
     * @return void
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
     * 分页获取简历列表（管理员）
     * 【功能说明】管理员分页查询平台所有简历
     * @param page 页码
     * @param size 每页大小
     * @return PageResult<?> 分页结果
     */
    public PageResult<?> getResumeList(int page, int size) {
        return resumeAppService.getList(page, size);
    }

    /**
     * 分页获取职位列表（管理员）
     * 【功能说明】管理员分页查询平台所有已发布职位
     * @param page 页码
     * @param size 每页大小
     * @return PageResult<Job> 分页结果
     */
    public PageResult<Job> getJobList(int page, int size) {
        // 简化实现：返回所有职位后进行分页
        // 正式环境应给JobRepository添加分页支持
        List<Job> allJobs = jobRepository.findAll();
        int start = (page - 1) * size;
        int end = Math.min(start + size, allJobs.size());
        List<Job> pageJobs = start < allJobs.size() ? allJobs.subList(start, end) : new ArrayList<>();
        return new PageResult<>(pageJobs, (long) allJobs.size(), page, size);
    }

    /**
     * 获取技能标签列表（管理员）
     * 【功能说明】管理员查询平台所有技能标签
     * @return List<SkillTag> 技能标签列表
     */
    public List<SkillTag> getSkillList() {
        return skillTagAppService.getAllSkillTags();
    }

    /**
     * 分页获取解析任务列表（管理员）
     * 【功能说明】管理员分页查询平台所有简历解析任务
     * @param page 页码
     * @param size 每页大小
     * @return PageResult<ParseTask> 分页结果
     */
    public PageResult<ParseTask> getTaskList(int page, int size) {
        // 简化实现：返回所有任务后进行分页
        // 正式环境应给ParseTaskRepository添加分页支持
        List<ParseTask> allTasks = parseTaskRepository.findAll();
        int start = (page - 1) * size;
        int end = Math.min(start + size, allTasks.size());
        List<ParseTask> pageTasks = start < allTasks.size() ? allTasks.subList(start, end) : new ArrayList<>();
        return new PageResult<>(pageTasks, (long) allTasks.size(), page, size);
    }

    /**
     * 重试失败的任务
     * 【功能说明】将FAILED状态的任务重置为PENDING重新执行
     * @param taskId 任务ID
     * @return void
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
        // TODO(sidifensen: 2026-04-16): 发送MQ消息重新触发解析
    }

    /**
     * 获取企业认证列表（待审核企业）
     * 【功能说明】查询所有待认证审核的企业列表
     * @return List<Company> 待审核企业列表
     */
    public List<Company> getCompanyAuthList() {
        return companyAppService.getPendingCompanies();
    }
}
