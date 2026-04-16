package com.graphhire.admin.interfaces.controller;

import com.graphhire.admin.application.command.AuthCompanyCmd;
import com.graphhire.admin.application.command.DisableUserCmd;
import com.graphhire.admin.application.query.UserListQuery;
import com.graphhire.admin.application.service.AdminAppService;
import com.graphhire.admin.interfaces.dto.response.DashboardStatsResponse;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.interfaces.dto.request.LoginRequest;
import com.graphhire.auth.interfaces.dto.response.LoginResponse;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin controller for admin operations.
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminAppService adminAppService;

    @Autowired
    private AuthAppService authAppService;

    /**
     * Admin login - only users with user_type=ADMIN can login
     */
    @PostMapping("/login")
    public Result<LoginResponse> adminLogin(@RequestBody LoginRequest request) {
        return Result.success(authAppService.adminLogin(request.getUsername(), request.getPassword()));
    }

    /**
     * Get dashboard statistics.
     */
    @GetMapping("/dashboard/stats")
    public Result<DashboardStatsResponse> getDashboardStats() {
        return Result.success(adminAppService.getDashboardStats());
    }

    /**
     * Authenticate (approve/reject) a company.
     */
    @PutMapping("/company/auth/{id}")
    public Result<Void> authCompany(@PathVariable Long id, @RequestBody AuthCompanyCmd cmd) {
        adminAppService.authCompany(id, cmd);
        return Result.success();
    }

    /**
     * Modify user status (enable/disable).
     */
    @PutMapping("/user/{id}/status")
    public Result<Void> modifyUserStatus(@PathVariable Long id, @RequestParam boolean enabled) {
        adminAppService.modifyUserStatus(id, enabled);
        return Result.success();
    }

    /**
     * Disable a user account.
     */
    @PostMapping("/user/disable")
    public Result<Void> disableUser(@RequestBody DisableUserCmd cmd) {
        adminAppService.disableUser(cmd);
        return Result.success();
    }

    /**
     * Get user list with pagination.
     */
    @GetMapping("/user/list")
    public Result<List<Long>> getUserList(@RequestBody UserListQuery query) {
        return Result.success(adminAppService.getUserList(query));
    }

    /**
     * Get resume library list with pagination (admin).
     */
    @GetMapping("/resume/list")
    public Result<?> getResumeList(@RequestParam(defaultValue = "1") int page,
                                   @RequestParam(defaultValue = "10") int size) {
        return Result.success(adminAppService.getResumeList(page, size));
    }

    /**
     * Get job library list with pagination (admin).
     */
    @GetMapping("/job/list")
    public Result<?> getJobList(@RequestParam(defaultValue = "1") int page,
                                @RequestParam(defaultValue = "10") int size) {
        return Result.success(adminAppService.getJobList(page, size));
    }

    /**
     * Get skill tag list (admin).
     */
    @GetMapping("/skill/list")
    public Result<?> getSkillList() {
        return Result.success(adminAppService.getSkillList());
    }

    /**
     * Get parse task list with pagination (admin).
     */
    @GetMapping("/task/list")
    public Result<?> getTaskList(@RequestParam(defaultValue = "1") int page,
                                 @RequestParam(defaultValue = "10") int size) {
        return Result.success(adminAppService.getTaskList(page, size));
    }

    /**
     * Retry a failed parse task.
     */
    @PostMapping("/task/{id}/retry")
    public Result<Void> retryTask(@PathVariable Long id) {
        adminAppService.retryTask(id);
        return Result.success();
    }

    /**
     * Get company auth list (pending companies).
     */
    @GetMapping("/company/auth/list")
    public Result<?> getCompanyAuthList() {
        return Result.success(adminAppService.getCompanyAuthList());
    }
}
