package com.graphhire.admin.interface.controller;

import com.graphhire.admin.application.command.AuthCompanyCmd;
import com.graphhire.admin.application.command.DisableUserCmd;
import com.graphhire.admin.application.query.UserListQuery;
import com.graphhire.admin.application.service.AdminAppService;
import com.graphhire.admin.interface.dto.response.DashboardStatsResponse;
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
    @PostMapping("/company/auth")
    public Result<Void> authCompany(@RequestBody AuthCompanyCmd cmd) {
        adminAppService.authCompany(cmd.getCompanyId(), cmd);
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
}
