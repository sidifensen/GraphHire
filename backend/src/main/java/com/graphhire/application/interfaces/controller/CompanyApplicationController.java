package com.graphhire.application.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.application.application.service.ApplicationAppService;
import com.graphhire.application.domain.model.Application;
import com.graphhire.application.domain.model.ApplicationStatus;
import com.graphhire.application.domain.model.TalentPool;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/company")
public class CompanyApplicationController {

    @Autowired
    private ApplicationAppService applicationAppService;

    @Autowired
    private CompanyAppService companyAppService;

    @GetMapping("/applications")
    public Result<List<Application>> getApplications(
            @RequestParam(required = false) ApplicationStatus status) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        return Result.success(applicationAppService.getCompanyApplications(companyId, status));
    }

    @GetMapping("/applications/{id}")
    public Result<Application> getApplicationDetail(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Application application = applicationAppService.getApplicationById(id);
        if (!application.getCompanyId().equals(companyId)) {
            throw new RuntimeException("无权查看此投递");
        }
        return Result.success(application);
    }

    @PutMapping("/applications/{id}/status")
    public Result<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        applicationAppService.updateApplicationStatus(companyId, id, status);
        return Result.success();
    }

    @PostMapping("/applications/{id}/interview")
    public Result<Void> sendInterviewInvitation(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        LocalDateTime interviewTime = LocalDateTime.parse(request.get("interviewTime"));
        String location = request.get("location");
        String remark = request.get("remark");
        applicationAppService.sendInterviewInvitation(companyId, id, interviewTime, location, remark);
        return Result.success();
    }

    @PostMapping("/applications/{id}/reject")
    public Result<Void> rejectApplication(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        applicationAppService.updateApplicationStatus(companyId, id, ApplicationStatus.REJECTED);
        return Result.success();
    }

    @PostMapping("/applications/{id}/accept")
    public Result<Void> acceptApplication(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        applicationAppService.updateApplicationStatus(companyId, id, ApplicationStatus.ACCEPTED);
        return Result.success();
    }

    @PostMapping("/talent-pool")
    public Result<Void> addToTalentPool(@RequestBody Map<String, Object> request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        Long resumeId = ((Number) request.get("resumeId")).longValue();
        String note = (String) request.get("note");
        applicationAppService.addToTalentPool(companyId, resumeId, note);
        return Result.success();
    }

    @DeleteMapping("/talent-pool/{resumeId}")
    public Result<Void> removeFromTalentPool(@PathVariable Long resumeId) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        applicationAppService.removeFromTalentPool(companyId, resumeId);
        return Result.success();
    }

    @GetMapping("/talent-pool")
    public Result<List<TalentPool>> getTalentPool() {
        Long userId = StpUtil.getLoginIdAsLong();
        Long companyId = companyAppService.getCompanyIdByUserId(userId);
        return Result.success(applicationAppService.getCompanyTalentPool(companyId));
    }
}
