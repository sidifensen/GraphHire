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
 * 管理员操作接口
 * 提供管理员登录、仪表盘统计、企业认证、用户管理等功能
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminAppService adminAppService;

    @Autowired
    private AuthAppService authAppService;

    /**
     * 管理员登录
     * @param request 登录请求
     * @return 登录响应
     */
    @PostMapping("/login")
    public Result<LoginResponse> adminLogin(@RequestBody LoginRequest request) {
        return Result.success(authAppService.adminLogin(request.getUsername(), request.getPassword()));
    }

    /**
     * 获取仪表盘统计数据
     * @return 统计数据
     */
    @GetMapping("/dashboard/stats")
    public Result<DashboardStatsResponse> getDashboardStats() {
        return Result.success(adminAppService.getDashboardStats());
    }

    /**
     * 企业认证授权
     * @param id 企业ID
     * @param cmd 认证命令
     * @return 认证结果
     */
    @PutMapping("/company/auth/{id}")
    public Result<Void> authCompany(@PathVariable Long id, @RequestBody AuthCompanyCmd cmd) {
        adminAppService.authCompany(id, cmd);
        return Result.success();
    }

    /**
     * 修改用户状态
     * @param id 用户ID
     * @param enabled 是否启用
     * @return 操作结果
     */
    @PutMapping("/user/{id}/status")
    public Result<Void> modifyUserStatus(@PathVariable Long id, @RequestParam boolean enabled) {
        adminAppService.modifyUserStatus(id, enabled);
        return Result.success();
    }

    /**
     * 禁用用户
     * @param cmd 禁用命令
     * @return 操作结果
     */
    @PostMapping("/user/disable")
    public Result<Void> disableUser(@RequestBody DisableUserCmd cmd) {
        adminAppService.disableUser(cmd);
        return Result.success();
    }

    /**
     * 获取用户列表
     * @param query 查询条件
     * @return 用户列表
     */
    @GetMapping("/user/list")
    public Result<List<Long>> getUserList(@RequestBody UserListQuery query) {
        return Result.success(adminAppService.getUserList(query));
    }

    /**
     * 获取简历列表
     * @param page 页码
     * @param size 每页大小
     * @return 简历列表
     */
    @GetMapping("/resume/list")
    public Result<?> getResumeList(@RequestParam(defaultValue = "1") int page,
                                   @RequestParam(defaultValue = "10") int size) {
        return Result.success(adminAppService.getResumeList(page, size));
    }

    /**
     * 获取职位列表
     * @param page 页码
     * @param size 每页大小
     * @return 职位列表
     */
    @GetMapping("/job/list")
    public Result<?> getJobList(@RequestParam(defaultValue = "1") int page,
                                @RequestParam(defaultValue = "10") int size) {
        return Result.success(adminAppService.getJobList(page, size));
    }

    /**
     * 获取技能标签列表
     * @return 技能标签列表
     */
    @GetMapping("/skill/list")
    public Result<?> getSkillList() {
        return Result.success(adminAppService.getSkillList());
    }

    /**
     * 获取任务列表
     * @param page 页码
     * @param size 每页大小
     * @return 任务列表
     */
    @GetMapping("/task/list")
    public Result<?> getTaskList(@RequestParam(defaultValue = "1") int page,
                                 @RequestParam(defaultValue = "10") int size) {
        return Result.success(adminAppService.getTaskList(page, size));
    }

    /**
     * 重试任务
     * @param id 任务ID
     * @return 重试结果
     */
    @PostMapping("/task/{id}/retry")
    public Result<Void> retryTask(@PathVariable Long id) {
        adminAppService.retryTask(id);
        return Result.success();
    }

    /**
     * 获取企业认证列表
     * @return 认证列表
     */
    @GetMapping("/company/auth/list")
    public Result<?> getCompanyAuthList() {
        return Result.success(adminAppService.getCompanyAuthList());
    }

    /**
     * 审批通过公司
     * @param id 公司ID
     * @return 审批结果
     */
    @PostMapping("/company/{id}/approve")
    public Result<Void> approveCompany(@PathVariable Long id) {
        adminAppService.approveCompany(id);
        return Result.success();
    }

    /**
     * 拒绝公司
     * @param id 公司ID
     * @return 拒绝结果
     */
    @PostMapping("/company/{id}/reject")
    public Result<Void> rejectCompany(@PathVariable Long id) {
        adminAppService.rejectCompany(id);
        return Result.success();
    }

    /**
     * 获取待审批公司列表
     * @return 待审批公司列表
     */
    @GetMapping("/company/pending")
    public Result<?> getPendingCompanies() {
        return Result.success(adminAppService.getPendingCompanies());
    }

    /**
     * 根据认证状态获取公司列表
     * @param authStatus 认证状态
     * @return 公司列表
     */
    @GetMapping("/company/auth-list")
    public Result<?> getCompaniesByAuthStatus(@RequestParam Integer authStatus) {
        return Result.success(adminAppService.getCompaniesByAuthStatus(authStatus));
    }
}
