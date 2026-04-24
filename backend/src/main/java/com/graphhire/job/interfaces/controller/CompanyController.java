package com.graphhire.job.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.application.application.service.ApplicationAppService;
import com.graphhire.application.domain.repository.ApplicationRepository;
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
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.SalaryRange;
import com.graphhire.job.interfaces.dto.request.CreateStaffRequest;
import com.graphhire.job.interfaces.dto.request.SalaryUpdateRequest;
import com.graphhire.job.interfaces.dto.request.StatusChangeRequest;
import com.graphhire.job.interfaces.dto.response.CompanyDashboardJobItemResponse;
import com.graphhire.job.interfaces.dto.response.CompanyDashboardResponse;
import com.graphhire.job.interfaces.dto.response.CompanyJobListItemResponse;
import com.graphhire.job.interfaces.dto.response.CompanyStaffListItemResponse;
import com.graphhire.job.interfaces.dto.response.CompanyStaffStatsResponse;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.match.interfaces.dto.response.MatchDetailResponse;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

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
    private ApplicationRepository applicationRepository;

    @Autowired
    private MatchRecordRepository matchRecordRepository;

    @Autowired
    private SkillGraphClient skillGraphClient;

    @Autowired
    private ApplicationAppService applicationAppService;

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
        Long companyId = currentCompanyId();
        companyAppService.updateCompanyInfo(companyId, name, contactName, contactPhone,
                contactEmail, description, website);
        return Result.success();
    }

    @PostMapping("/auth")
    public Result<Void> submitAuthMaterials(@RequestParam(required = false) String licenseUrl) {
        Long userId = StpUtil.getLoginIdAsLong();
        companyAppService.submitAuthMaterials(userId, licenseUrl);
        return Result.success();
    }

    @GetMapping("/dashboard")
    public Result<CompanyDashboardResponse> getDashboard() {
        Long companyId = currentCompanyId();
        List<Job> jobs = jobAppService.getJobsByCompany(companyId);
        List<Job> activeJobs = jobs.stream()
                .filter(job -> job.getStatus() == JobStatus.PUBLISHED)
                .toList();

        CompanyDashboardResponse response = new CompanyDashboardResponse();
        response.setPendingApplicationCount(applicationRepository.findByCompanyId(companyId).size());
        response.setNewMatchCandidateCount(activeJobs.stream()
                .mapToLong(job -> matchRecordRepository.findByJobId(job.getId()).size())
                .sum());
        response.setActiveJobCount(activeJobs.size());
        response.setRecentJobs(jobs.stream()
                .sorted(Comparator.comparing(Job::getId, Comparator.nullsLast(Long::compareTo)).reversed())
                .limit(5)
                .map(this::toDashboardJobItem)
                .toList());
        return Result.success(response);
    }

    @PostMapping("/job")
    public Result<Long> publishJob(@RequestBody PublishJobCmd cmd) {
        Long companyId = currentCompanyId();
        Job job = jobAppService.createJob(companyId, cmd.getTitle(), cmd.getDepartment(), cmd.getHeadcount(),
                cmd.getLocation(), cmd.getSalaryRange(), cmd.getSkills(),
                cmd.getDescription());
        return Result.success(job.getId());
    }

    public Result<List<CompanyJobListItemResponse>> listJobs() {
        return listJobs(null, null);
    }

    @GetMapping("/job/list")
    public Result<List<CompanyJobListItemResponse>> listJobs(@RequestParam(required = false) String status,
                                                             @RequestParam(required = false) String keyword) {
        Long companyId = currentCompanyId();
        List<Job> jobs = jobAppService.getJobsByCompany(companyId).stream()
                .filter(job -> status == null || status.isBlank() || job.getStatus().name().equalsIgnoreCase(status))
                .filter(job -> keyword == null || keyword.isBlank() || containsIgnoreCase(job.getTitle(), keyword))
                .sorted(Comparator.comparing(Job::getId, Comparator.nullsLast(Long::compareTo)).reversed())
                .toList();
        return Result.success(jobs.stream().map(this::toJobListItem).toList());
    }

    @GetMapping("/job/{id}")
    public Result<Job> getJob(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        Job job = jobAppService.getJobById(id);
        ensureJobOwnership(job, companyId);
        return Result.success(job);
    }

    @PutMapping("/job/{id}")
    public Result<Void> updateJob(@PathVariable Long id, @RequestBody PublishJobCmd cmd) {
        Long companyId = currentCompanyId();
        Job job = jobAppService.getJobById(id);
        ensureJobOwnership(job, companyId);
        jobAppService.updateJobInfo(id, cmd);
        return Result.success();
    }

    @PutMapping("/job/{id}/status")
    public Result<Void> toggleJobStatus(@PathVariable Long id, @RequestBody StatusChangeRequest request) {
        Long companyId = currentCompanyId();
        Job job = jobAppService.getJobById(id);
        ensureJobOwnership(job, companyId);
        if (request.isPublish()) {
            if (job.getStatus() != JobStatus.PUBLISHED) {
                jobAppService.publishJob(id, null);
            }
        } else {
            if (job.getStatus() == JobStatus.PUBLISHED) {
                jobAppService.closeJob(id);
            }
        }
        return Result.success();
    }

    @PostMapping("/job/{id}/publish")
    public Result<Void> publishJob(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        Job job = jobAppService.getJobById(id);
        ensureJobOwnership(job, companyId);
        if (job.getStatus() != JobStatus.PUBLISHED) {
            jobAppService.publishJob(id, null);
        }
        return Result.success();
    }

    @PostMapping("/job/{id}/close")
    public Result<Void> closeJob(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        Job job = jobAppService.getJobById(id);
        ensureJobOwnership(job, companyId);
        if (job.getStatus() == JobStatus.PUBLISHED) {
            jobAppService.closeJob(id);
        }
        return Result.success();
    }

    @PutMapping("/job/{id}/salary")
    public Result<Void> updateSalary(@PathVariable Long id, @RequestBody SalaryUpdateRequest request) {
        Long companyId = currentCompanyId();
        Job job = jobAppService.getJobById(id);
        ensureJobOwnership(job, companyId);
        SalaryRange salaryRange = SalaryRange.of(request.getMin(), request.getMax(), request.getUnit());
        jobAppService.updateSalary(id, salaryRange);
        return Result.success();
    }

    @DeleteMapping("/job/{id}")
    public Result<Void> deleteJob(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        Job job = jobAppService.getJobById(id);
        ensureJobOwnership(job, companyId);
        jobAppService.deleteJob(id);
        return Result.success();
    }

    @GetMapping("/job/{id}/graph")
    public Result<Map<String, Object>> getJobGraph(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        Job job = jobAppService.getJobById(id);
        ensureJobOwnership(job, companyId);
        Map<String, Object> graph = skillGraphClient.getJobSkillGraph(id);
        return Result.success(graph);
    }

    @GetMapping("/match/{resumeId}")
    public Result<MatchDetailResponse> getMatchDetail(@PathVariable Long resumeId, @RequestParam Long jobId) {
        Long companyId = currentCompanyId();
        MatchDetailResponse response = matchAppService.getMatchDetailForCompany(resumeId, jobId, companyId);
        return Result.success(response);
    }

    @GetMapping("/recommend/resumes")
    public Result<List<MatchDetailResponse>> getRecommendedResumes(@RequestParam(required = false) Long jobId) {
        Long companyId = currentCompanyId();
        if (jobId != null) {
            Job job = jobAppService.getJobById(jobId);
            ensureJobOwnership(job, companyId);
            return Result.success(matchAppService.getMatchListForJob(jobId));
        }
        List<MatchDetailResponse> recommendations = matchAppService.getRecommendedResumesForCompany(companyId);
        return Result.success(recommendations);
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

    @PutMapping("/{id}")
    public Result<Void> updateCompany(@PathVariable Long id,
                                      @RequestParam(required = false) String name,
                                      @RequestParam(required = false) String contactName,
                                      @RequestParam(required = false) String contactPhone,
                                      @RequestParam(required = false) String contactEmail,
                                      @RequestParam(required = false) String description,
                                      @RequestParam(required = false) String website) {
        Long companyId = currentCompanyId();
        if (!companyId.equals(id)) {
            throw new Exceptions.ForbiddenException("无权修改其他企业信息");
        }
        companyAppService.updateCompanyInfo(id, name, contactName, contactPhone,
                contactEmail, description, website);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Company> getCompany(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        if (!companyId.equals(id)) {
            throw new Exceptions.ForbiddenException("无权查看其他企业信息");
        }
        return Result.success(companyAppService.getCompanyById(id));
    }

    @GetMapping("/staff/list")
    public Result<List<CompanyStaffListItemResponse>> getStaffList() {
        Long companyId = currentCompanyId();
        List<CompanyStaffListItemResponse> staffList = companyStaffRepository.findByCompanyId(companyId).stream()
                .sorted(Comparator.comparing(CompanyStaff::getId, Comparator.nullsLast(Long::compareTo)))
                .map(this::toStaffListItem)
                .toList();
        return Result.success(staffList);
    }

    @GetMapping("/staff/stats")
    public Result<CompanyStaffStatsResponse> getStaffStats() {
        Long companyId = currentCompanyId();
        List<CompanyStaff> staffList = companyStaffRepository.findByCompanyId(companyId);
        CompanyStaffStatsResponse response = new CompanyStaffStatsResponse();
        response.setTotalCount(staffList.size());
        response.setOwnerCount(staffList.stream().filter(staff -> "OWNER".equalsIgnoreCase(staff.getPost())).count());
        response.setHrCount(staffList.stream().filter(staff -> "HR".equalsIgnoreCase(staff.getPost())).count());
        response.setRecruiterCount(staffList.stream().filter(staff -> "RECRUITER".equalsIgnoreCase(staff.getPost())).count());
        return Result.success(response);
    }

    @PostMapping("/staff/create")
    public Result<Void> createStaff(@RequestBody CreateStaffRequest request) {
        CompanyStaff currentStaff = currentStaff();
        if (!"OWNER".equals(currentStaff.getPost())) {
            throw new Exceptions.ForbiddenException("只有企业主可以创建员工账号");
        }
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
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw Exceptions.BusinessException.of("用户名已存在");
        }

        User newUser = new User();
        newUser.setUsername(Username.of(request.getUsername()));
        newUser.setPassword(EncryptedPassword.encode(request.getPassword()));
        newUser.setUserType(UserType.COMPANY);
        newUser.setStatus(AuthStatus.VERIFIED);
        userRepository.save(newUser);

        CompanyStaff newStaff = new CompanyStaff();
        newStaff.setUserId(newUser.getId());
        newStaff.setCompanyId(currentStaff.getCompanyId());
        newStaff.setPost(post);
        companyStaffRepository.save(newStaff);

        return Result.success();
    }

    @PostMapping("/staff/{staffId}/reset-password")
    public Result<Map<String, String>> resetStaffPassword(@PathVariable Long staffId) {
        CompanyStaff currentStaff = currentStaff();
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

        Map<String, String> data = new HashMap<>();
        data.put("newPassword", newPassword);
        return Result.success(data);
    }

    @PutMapping("/staff/{staffId}/status")
    public Result<Void> updateStaffStatus(@PathVariable Long staffId, @RequestParam boolean disabled) {
        CompanyStaff currentStaff = currentStaff();
        if (!"OWNER".equals(currentStaff.getPost())) {
            throw new Exceptions.ForbiddenException("只有企业主可以修改员工状态");
        }

        CompanyStaff targetStaff = companyStaffRepository.findById(staffId)
                .orElseThrow(() -> Exceptions.BusinessException.of("员工不存在"));
        if (!targetStaff.getCompanyId().equals(currentStaff.getCompanyId())) {
            throw new Exceptions.ForbiddenException("无权操作此员工");
        }
        if ("OWNER".equals(targetStaff.getPost())) {
            throw new Exceptions.ForbiddenException("不能禁用企业主账号");
        }

        User targetUser = userRepository.findById(targetStaff.getUserId())
                .orElseThrow(() -> Exceptions.BusinessException.of("用户不存在"));
        targetUser.setStatus(disabled ? AuthStatus.DISABLED : AuthStatus.VERIFIED);
        userRepository.save(targetUser);
        return Result.success();
    }

    @PostMapping("/applications/interview-invite")
    public Result<Void> inviteInterviewByResume(@RequestBody Map<String, String> request) {
        Long companyId = currentCompanyId();
        Long resumeId = Long.valueOf(request.get("resumeId"));
        Long jobId = Long.valueOf(request.get("jobId"));
        String location = request.get("location");
        String remark = request.get("remark");
        String interviewTimeRaw = request.get("interviewTime");
        LocalDateTime interviewTime = interviewTimeRaw == null || interviewTimeRaw.isBlank()
                ? LocalDateTime.now().plusDays(1)
                : LocalDateTime.parse(interviewTimeRaw);
        applicationAppService.sendInterviewInvitationByResume(companyId, resumeId, jobId, interviewTime, location, remark);
        return Result.success();
    }

    private Long currentCompanyId() {
        Long userId = StpUtil.getLoginIdAsLong();
        return companyAppService.getCompanyIdByUserId(userId);
    }

    private CompanyStaff currentStaff() {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        return companyStaffRepository.findByUserId(currentUserId)
                .orElseThrow(() -> Exceptions.BusinessException.of("非企业用户"));
    }

    private void ensureJobOwnership(Job job, Long companyId) {
        if (!job.getCompanyId().equals(companyId)) {
            throw new Exceptions.ForbiddenException("无权操作该职位");
        }
    }

    private boolean containsIgnoreCase(String source, String keyword) {
        return source != null && source.toLowerCase().contains(keyword.toLowerCase());
    }

    private CompanyDashboardJobItemResponse toDashboardJobItem(Job job) {
        CompanyDashboardJobItemResponse item = new CompanyDashboardJobItemResponse();
        item.setId(job.getId());
        item.setTitle(job.getTitle());
        item.setDepartment(job.getDepartment());
        item.setApplyCount(applicationRepository.findByJobId(job.getId()).size());
        item.setMatchCount(matchRecordRepository.findByJobId(job.getId()).size());
        item.setStatus(job.getStatus().name());
        item.setPublishedAt(job.getPublishedAt());
        return item;
    }

    private CompanyJobListItemResponse toJobListItem(Job job) {
        CompanyJobListItemResponse item = new CompanyJobListItemResponse();
        item.setId(job.getId());
        item.setTitle(job.getTitle());
        item.setDepartment(job.getDepartment());
        item.setCity(job.getLocation() != null ? job.getLocation().getCity() : null);
        item.setSalaryMin(job.getSalaryRange() != null ? job.getSalaryRange().getMin() : null);
        item.setSalaryMax(job.getSalaryRange() != null ? job.getSalaryRange().getMax() : null);
        item.setSalaryUnit(job.getSalaryRange() != null ? job.getSalaryRange().getUnit() : null);
        item.setStatus(job.getStatus().name());
        item.setParseStatus(null);
        item.setViewCount(0L);
        item.setApplyCount(applicationRepository.findByJobId(job.getId()).size());
        item.setMatchCount(matchRecordRepository.findByJobId(job.getId()).size());
        item.setPublishedAt(job.getPublishedAt());
        return item;
    }

    private CompanyStaffListItemResponse toStaffListItem(CompanyStaff staff) {
        CompanyStaffListItemResponse item = new CompanyStaffListItemResponse();
        item.setId(staff.getId());
        item.setUserId(staff.getUserId());
        item.setPost(staff.getPost());
        item.setStatus("ACTIVE");
        userRepository.findById(staff.getUserId()).ifPresent(user -> {
            String username = user.getUsername() != null ? user.getUsername().getValue() : null;
            item.setUsername(username);
            item.setDisplayName(username != null && username.contains("@") ? username.substring(0, username.indexOf('@')) : username);
            item.setLastLoginTime("-");
            item.setStatus(user.getStatus() == AuthStatus.DISABLED ? "DISABLED" : "ACTIVE");
        });
        return item;
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
