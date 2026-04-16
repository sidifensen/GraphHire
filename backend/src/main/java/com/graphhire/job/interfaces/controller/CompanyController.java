package com.graphhire.job.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.auth.domain.vo.EncryptedPassword;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.auth.domain.vo.Username;
import com.graphhire.common.vo.Exceptions;
import com.graphhire.common.vo.Result;
import com.graphhire.job.application.command.PublishJobCmd;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.application.service.JobAppService;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;
import com.graphhire.job.interfaces.dto.request.CreateStaffRequest;
import com.graphhire.job.interfaces.dto.request.SalaryUpdateRequest;
import com.graphhire.job.interfaces.dto.request.StatusChangeRequest;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.match.interfaces.dto.response.MatchDetailResponse;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/company")
public class CompanyController {

    @Autowired
    private CompanyAppService companyAppService;

    @Autowired
    private JobAppService jobAppService;

    @Autowired
    private MatchAppService matchAppService;

    @Autowired
    private CompanyStaffRepository companyStaffRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillGraphClient skillGraphClient;

    /**
     * 获取公司信息
     * @return 公司信息
     */
    @GetMapping("/info")
    public Result<Company> getCompanyInfo() {
        Long userId = StpUtil.getLoginIdAsLong();
        Company company = companyAppService.getCompanyByUserId(userId);
        return Result.success(company);
    }

    /**
     * 更新公司信息
     * @param name 公司名称
     * @param contactName 联系人姓名
     * @param contactPhone 联系人电话
     * @param contactEmail 联系人邮箱
     * @param description 公司描述
     * @param website 公司网站
     * @return 更新结果
     */
    @PutMapping("/info")
    public Result<Void> updateCompanyInfo(@RequestParam(required = false) String name,
                                         @RequestParam(required = false) String contactName,
                                         @RequestParam(required = false) String contactPhone,
                                         @RequestParam(required = false) String contactEmail,
                                         @RequestParam(required = false) String description,
                                         @RequestParam(required = false) String website) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        companyAppService.updateCompanyInfo(companyId, name, contactName, contactPhone,
                contactEmail, description, website);
        return Result.success();
    }

    /**
     * 提交认证材料
     * @param licenseUrl 营业执照URL
     * @return 提交结果
     */
    @PostMapping("/auth")
    public Result<Void> submitAuthMaterials(@RequestParam(required = false) String licenseUrl) {
        Long userId = StpUtil.getLoginIdAsLong();
        companyAppService.submitAuthMaterials(userId, licenseUrl);
        return Result.success();
    }

    /**
     * 发布职位
     * @param cmd 职位信息
     * @return 发布结果
     */
    @PostMapping("/job")
    public Result<Long> publishJob(@RequestBody PublishJobCmd cmd) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.createJob(companyId, cmd.getTitle(), cmd.getDepartment(), cmd.getHeadcount(),
                cmd.getLocation(), cmd.getSalaryRange(), cmd.getRequiredSkills(), cmd.getPreferredSkills(),
                cmd.getDescription());
        return Result.success(job.getId());
    }

    /**
     * 获取职位列表
     * @return 职位列表
     */
    @GetMapping("/job/list")
    public Result<List<Job>> listJobs() {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        List<Job> jobs = jobAppService.getJobsByCompany(companyId);
        return Result.success(jobs);
    }

    /**
     * 获取职位详情
     * @param id 职位ID
     * @return 职位详情
     */
    @GetMapping("/job/{id}")
    public Result<Job> getJob(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.getJobById(id);
        if (!job.getCompanyId().equals(companyId)) {
            throw new Exceptions.ForbiddenException("无权查看该职位");
        }
        return Result.success(job);
    }

    /**
     * 更新职位
     * @param id 职位ID
     * @param cmd 更新请求
     * @return 更新结果
     */
    @PutMapping("/job/{id}")
    public Result<Void> updateJob(@PathVariable Long id, @RequestBody PublishJobCmd cmd) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.getJobById(id);
        if (!job.getCompanyId().equals(companyId)) {
            throw new Exceptions.ForbiddenException("无权操作该职位");
        }
        jobAppService.updateJobInfo(id, cmd);
        return Result.success();
    }

    /**
     * 切换职位状态
     * @param id 职位ID
     * @param request 状态变更请求
     * @return 操作结果
     */
    @PutMapping("/job/{id}/status")
    public Result<Void> toggleJobStatus(@PathVariable Long id, @RequestBody StatusChangeRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.getJobById(id);
        if (!job.getCompanyId().equals(companyId)) {
            throw new Exceptions.ForbiddenException("无权操作该职位");
        }
        if (request.isPublish()) {
            jobAppService.publishJob(id, null);
        } else {
            jobAppService.closeJob(id);
        }
        return Result.success();
    }

    /**
     * 发布职位
     * @param id 职位ID
     * @return 发布结果
     */
    @PostMapping("/job/{id}/publish")
    public Result<Void> publishJob(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.getJobById(id);
        if (!job.getCompanyId().equals(companyId)) {
            throw new Exceptions.ForbiddenException("无权操作该职位");
        }
        jobAppService.publishJob(id, null);
        return Result.success();
    }

    /**
     * 关闭职位
     * @param id 职位ID
     * @return 关闭结果
     */
    @PostMapping("/job/{id}/close")
    public Result<Void> closeJob(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.getJobById(id);
        if (!job.getCompanyId().equals(companyId)) {
            throw new Exceptions.ForbiddenException("无权操作该职位");
        }
        jobAppService.closeJob(id);
        return Result.success();
    }

    /**
     * 更新薪资范围
     * @param id 职位ID
     * @param request 薪资更新请求
     * @return 更新结果
     */
    @PutMapping("/job/{id}/salary")
    public Result<Void> updateSalary(@PathVariable Long id, @RequestBody SalaryUpdateRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.getJobById(id);
        if (!job.getCompanyId().equals(companyId)) {
            throw new Exceptions.ForbiddenException("无权操作该职位");
        }
        SalaryRange salaryRange = SalaryRange.of(request.getMin(), request.getMax(), request.getUnit());
        jobAppService.updateSalary(id, salaryRange);
        return Result.success();
    }

    /**
     * 删除职位
     * @param id 职位ID
     * @return 删除结果
     */
    @DeleteMapping("/job/{id}")
    public Result<Void> deleteJob(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.getJobById(id);
        if (!job.getCompanyId().equals(companyId)) {
            throw new Exceptions.ForbiddenException("无权操作该职位");
        }
        jobAppService.deleteJob(id);
        return Result.success();
    }

    /**
     * 重新解析职位
     * @param id 职位ID
     * @return 解析结果
     */
    @PostMapping("/job/{id}/parse")
    public Result<Void> reparseJob(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.getJobById(id);
        if (!job.getCompanyId().equals(companyId)) {
            throw new Exceptions.ForbiddenException("无权操作该职位");
        }
        jobAppService.triggerJobParse(id);
        return Result.success();
    }

    /**
     * 获取职位图谱
     * @param id 职位ID
     * @return 职位图谱
     */
    @GetMapping("/job/{id}/graph")
    public Result<Map<String, Object>> getJobGraph(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.getJobById(id);
        if (!job.getCompanyId().equals(companyId)) {
            throw new Exceptions.ForbiddenException("无权查看该职位");
        }
        Map<String, Object> graph = skillGraphClient.getJobSkillGraph(id);
        return Result.success(graph);
    }

    /**
     * 获取企业查看候选人简历的匹配详情
     * 【功能说明】企业首次查看时发送type=5的简历被查看通知
     */
    @GetMapping("/match/{resumeId}")
    public Result<MatchDetailResponse> getMatchDetail(@PathVariable Long resumeId, @RequestParam Long jobId) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        MatchDetailResponse response = matchAppService.getMatchDetailForCompany(resumeId, jobId, companyId);
        return Result.success(response);
    }

    /**
     * 获取企业推荐简历列表
     * 【功能说明】返回与企业已发布职位匹配的候选人列表
     */
    @GetMapping("/recommend/resumes")
    public Result<List<MatchDetailResponse>> getRecommendedResumes() {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        List<MatchDetailResponse> recommendations = matchAppService.getRecommendedResumesForCompany(companyId);
        return Result.success(recommendations);
    }

    /**
     * 创建公司
     * @param name 公司名称
     * @param unifiedSocialCreditCode 统一社会信用代码
     * @param licenseUrl 营业执照URL
     * @param contactName 联系人姓名
     * @param contactPhone 联系人电话
     * @param contactEmail 联系人邮箱
     * @return 创建结果
     */
    @PostMapping("/create")
    public Result<Long> createCompany(@RequestParam String name,
                                       @RequestParam String unifiedSocialCreditCode,
                                       @RequestParam(required = false) String licenseUrl,
                                       @RequestParam(required = false) String contactName,
                                       @RequestParam(required = false) String contactPhone,
                                       @RequestParam(required = false) String contactEmail) {
        Company company = companyAppService.createCompany(name, unifiedSocialCreditCode,
                licenseUrl, contactName, contactPhone, contactEmail);
        return Result.success(company.getId());
    }

    /**
     * 更新公司
     * @param id 公司ID
     * @param name 公司名称
     * @param contactName 联系人姓名
     * @param contactPhone 联系人电话
     * @param contactEmail 联系人邮箱
     * @param description 公司描述
     * @param website 公司网站
     * @return 更新结果
     */
    @PutMapping("/{id}")
    public Result<Void> updateCompany(@PathVariable Long id,
                                      @RequestParam(required = false) String name,
                                      @RequestParam(required = false) String contactName,
                                      @RequestParam(required = false) String contactPhone,
                                      @RequestParam(required = false) String contactEmail,
                                      @RequestParam(required = false) String description,
                                      @RequestParam(required = false) String website) {
        companyAppService.updateCompanyInfo(id, name, contactName, contactPhone,
                contactEmail, description, website);
        return Result.success();
    }

    /**
     * 获取公司
     * @param id 公司ID
     * @return 公司详情
     */
    @GetMapping("/{id}")
    public Result<Company> getCompany(@PathVariable Long id) {
        return Result.success(companyAppService.getCompanyById(id));
    }

    /**
     * 创建员工账号
     * 【功能说明】只有企业主(OWNER)可以创建员工，创建新用户(user_type=2企业)并建立company_staff关系
     */
    @PostMapping("/staff/create")
    public Result<Void> createStaff(@RequestBody CreateStaffRequest request) {
        // 步骤1：从Sa-Token session获取当前用户ID
        Long currentUserId = StpUtil.getLoginIdAsLong();

        // 步骤2：获取当前用户的company_staff记录
        CompanyStaff currentStaff = companyStaffRepository.findByUserId(currentUserId)
                .orElseThrow(() -> Exceptions.BusinessException.of("非企业用户"));

        // 步骤3：验证当前用户是企业主（只有企业主可以创建员工）
        if (!"OWNER".equals(currentStaff.getPost())) {
            throw new Exceptions.ForbiddenException("只有企业主可以创建员工账号");
        }

        // 步骤4：校验请求参数
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new Exceptions.ValidationException("用户名不能为空");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new Exceptions.ValidationException("密码不能为空");
        }
        if (request.getPost() == null || request.getPost().isBlank()) {
            throw new Exceptions.ValidationException("职位不能为空");
        }
        String post = request.getPost().toUpperCase();
        if (!"HR".equals(post) && !"RECRUITER".equals(post)) {
            throw new Exceptions.ValidationException("职位必须是HR或RECRUITER");
        }

        // 步骤5：检查用户名是否已存在
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw Exceptions.BusinessException.of("用户名已存在");
        }

        // 步骤6：创建使用BCrypt加密密码的新用户
        User newUser = new User();
        newUser.setUsername(Username.of(request.getUsername()));
        newUser.setPassword(EncryptedPassword.encode(request.getPassword()));
        newUser.setUserType(UserType.COMPANY);
        newUser.setStatus(AuthStatus.VERIFIED);
        userRepository.save(newUser);

        // 步骤7：创建company_staff记录
        CompanyStaff newStaff = new CompanyStaff();
        newStaff.setUserId(newUser.getId());
        newStaff.setCompanyId(currentStaff.getCompanyId());
        newStaff.setPost(post);
        companyStaffRepository.save(newStaff);

        return Result.success();
    }

    /**
     * 重置员工密码
     * 【功能说明】只有企业主(OWNER)可以重置员工密码，重置后发送新密码到员工手机
     */
    @PostMapping("/staff/{staffId}/reset-password")
    public Result<Void> resetStaffPassword(@PathVariable Long staffId) {
        Long currentUserId = StpUtil.getLoginIdAsLong();

        CompanyStaff currentStaff = companyStaffRepository.findByUserId(currentUserId)
                .orElseThrow(() -> Exceptions.BusinessException.of("非企业用户"));

        if (!"OWNER".equals(currentStaff.getPost())) {
            throw new Exceptions.ForbiddenException("只有企业主可以重置员工密码");
        }

        CompanyStaff targetStaff = companyStaffRepository.findById(staffId)
                .orElseThrow(() -> Exceptions.BusinessException.of("员工不存在"));

        if (!targetStaff.getCompanyId().equals(currentStaff.getCompanyId())) {
            throw new Exceptions.ForbiddenException("无权重置此员工密码");
        }

        if ("OWNER".equals(targetStaff.getPost())) {
            throw new Exceptions.ForbiddenException("不能重置企业主密码");
        }

        String newPassword = generateRandomPassword();
        User targetUser = userRepository.findById(targetStaff.getUserId())
                .orElseThrow(() -> Exceptions.BusinessException.of("用户不存在"));
        targetUser.setPassword(EncryptedPassword.encode(newPassword));
        userRepository.save(targetUser);

        return Result.success();
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 10; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }
}
