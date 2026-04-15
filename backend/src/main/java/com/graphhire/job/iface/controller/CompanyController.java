package com.graphhire.job.iface.controller;

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
import com.graphhire.job.iface.dto.request.CreateStaffRequest;
import com.graphhire.job.iface.dto.request.StatusChangeRequest;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.match.iface.dto.response.MatchDetailResponse;
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

    @GetMapping("/info")
    public Result<Company> getCompanyInfo() {
        Long userId = StpUtil.getLoginIdAsLong();
        Company company = companyAppService.getCompanyByUserId(userId);
        return Result.success(company);
    }

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

    @PostMapping("/auth")
    public Result<Void> submitAuthMaterials(@RequestParam(required = false) String licenseUrl) {
        // TODO: Implement auth materials submission
        return Result.success();
    }

    @PostMapping("/job")
    public Result<Long> publishJob(@RequestBody PublishJobCmd cmd) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.createJob(companyId, cmd.getTitle(), cmd.getDepartment(), cmd.getHeadcount(),
                cmd.getLocation(), cmd.getSalaryRange(), cmd.getRequiredSkills(), cmd.getPreferredSkills(),
                cmd.getDescription());
        return Result.success(job.getId());
    }

    @GetMapping("/job/list")
    public Result<List<Job>> listJobs() {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        List<Job> jobs = jobAppService.getJobsByCompany(companyId);
        return Result.success(jobs);
    }

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

    @PostMapping("/job/{id}/parse")
    public Result<Void> reparseJob(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Job job = jobAppService.getJobById(id);
        if (!job.getCompanyId().equals(companyId)) {
            throw new Exceptions.ForbiddenException("无权操作该职位");
        }
        // TODO: Implement job reparse
        return Result.success();
    }

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
     * Get match detail for company to view candidate resume.
     * Sends notification type=5 (RESUME_VIEWED) on first view from this company.
     */
    @GetMapping("/match/{resumeId}")
    public Result<MatchDetailResponse> getMatchDetail(@PathVariable Long resumeId, @RequestParam Long jobId) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        MatchDetailResponse response = matchAppService.getMatchDetailForCompany(resumeId, jobId, companyId);
        return Result.success(response);
    }

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

    @PostMapping("/{id}/approve")
    public Result<Void> approveCompany(@PathVariable Long id) {
        companyAppService.approveCompany(id);
        return Result.success();
    }

    @PostMapping("/{id}/reject")
    public Result<Void> rejectCompany(@PathVariable Long id) {
        companyAppService.rejectCompany(id);
        return Result.success();
    }

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

    @GetMapping("/{id}")
    public Result<Company> getCompany(@PathVariable Long id) {
        return Result.success(companyAppService.getCompanyById(id));
    }

    @GetMapping("/pending")
    public Result<List<Company>> getPendingCompanies() {
        return Result.success(companyAppService.getPendingCompanies());
    }

    @GetMapping
    public Result<List<Company>> getCompaniesByAuthStatus(@RequestParam AuthStatus authStatus) {
        return Result.success(companyAppService.getCompaniesByAuthStatus(authStatus));
    }

    /**
     * Create staff account - only OWNER can create staff
     * Creates new user (user_type=2 company) and company_staff record
     */
    @PostMapping("/staff/create")
    public Result<Void> createStaff(@RequestBody CreateStaffRequest request) {
        // 1. Get current user ID from Sa-Token session
        Long currentUserId = StpUtil.getLoginIdAsLong();

        // 2. Get current user's company_staff record
        CompanyStaff currentStaff = companyStaffRepository.findByUserId(currentUserId)
                .orElseThrow(() -> Exceptions.BusinessException.of("非企业用户"));

        // 3. Verify current user is OWNER (only owner can create staff)
        if (!"OWNER".equals(currentStaff.getPost())) {
            throw new Exceptions.ForbiddenException("只有企业主可以创建员工账号");
        }

        // 4. Validate request
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

        // 5. Check if username already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw Exceptions.BusinessException.of("用户名已存在");
        }

        // 6. Create new user with BCrypt encoded password
        User newUser = new User();
        newUser.setUsername(Username.of(request.getUsername()));
        newUser.setPassword(EncryptedPassword.encode(request.getPassword()));
        newUser.setUserType(UserType.COMPANY);
        newUser.setStatus(AuthStatus.VERIFIED);
        userRepository.save(newUser);

        // 7. Create company_staff record
        CompanyStaff newStaff = new CompanyStaff();
        newStaff.setUserId(newUser.getId());
        newStaff.setCompanyId(currentStaff.getCompanyId());
        newStaff.setPost(post);
        companyStaffRepository.save(newStaff);

        return Result.success();
    }
}
