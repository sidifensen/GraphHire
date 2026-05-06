package com.graphhire.admin.interfaces.controller;

import com.graphhire.admin.application.command.AuthCompanyCmd;
import com.graphhire.admin.application.query.UserListQuery;
import com.graphhire.admin.application.service.AdminAppService;
import com.graphhire.admin.interfaces.dto.request.*;
import com.graphhire.admin.interfaces.dto.response.*;
import com.graphhire.auth.application.service.AuthAppService;
import com.graphhire.auth.interfaces.dto.request.LoginRequest;
import com.graphhire.auth.interfaces.dto.response.LoginResponse;
import com.graphhire.industryskill.application.service.IndustrySkillProfileBootstrapService;
import com.graphhire.common.vo.Result;
import com.graphhire.skill.domain.model.SkillTag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminAppService adminAppService;

    @Autowired
    private AuthAppService authAppService;

    @Autowired
    private IndustrySkillProfileBootstrapService industrySkillProfileBootstrapService;

    @PostMapping("/login")
    public Result<LoginResponse> adminLogin(@RequestBody LoginRequest request) {
        return Result.success(authAppService.adminLogin(request.getUsername(), request.getPassword()));
    }

    @GetMapping("/dashboard/stats")
    public Result<DashboardStatsResponse> getDashboardStats() {
        return Result.success(adminAppService.getDashboardStats());
    }

    @GetMapping("/dashboard/trend")
    public Result<java.util.List<DashboardStatsResponse.TrendPoint>> getDashboardTrend(
            @RequestParam(defaultValue = "DAY") String dimension) {
        return Result.success(adminAppService.getDashboardTrend(dimension));
    }

    @GetMapping("/statistics")
    public Result<DashboardStatsResponse> getStatistics() {
        return Result.success(adminAppService.getDashboardStats());
    }

    @GetMapping("/company/auth-list")
    public Result<AdminPageResponse<AdminCompanyAuthItemResponse>> getCompanyAuthList(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.success(adminAppService.getCompanyAuthList(status, keyword, page, pageSize));
    }

    @PutMapping("/company/auth/{id}")
    public Result<Void> updateCompanyAuth(@PathVariable Long id, @RequestBody AdminCompanyAuthUpdateRequest request) {
        boolean approved = "APPROVED".equalsIgnoreCase(request.getStatus());
        String reason = approved ? null : request.getRejectReason();
        AuthCompanyCmd cmd = new AuthCompanyCmd(id, approved, reason);
        adminAppService.authCompany(id, cmd);
        return Result.success();
    }

    @PostMapping("/company/batch/approve")
    public Result<Void> batchApproveCompany(@RequestBody AdminBatchApproveRequest request) {
        adminAppService.batchApproveCompany(request.getIds());
        return Result.success();
    }

    @PostMapping("/company/batch/reject")
    public Result<Void> batchRejectCompany(@RequestBody AdminBatchRejectRequest request) {
        adminAppService.batchRejectCompany(request.getIds(), request.getReason());
        return Result.success();
    }

    @GetMapping("/user/list")
    public Result<AdminPageResponse<AdminUserItemResponse>> getUserList(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        UserListQuery query = new UserListQuery();
        query.setUserType(type);
        query.setStatus(status);
        query.setKeyword(keyword);
        query.setPage(page);
        query.setPageSize(pageSize);
        return Result.success(adminAppService.getUserList(query));
    }

    @PutMapping("/user/{id}/status")
    public Result<Void> modifyUserStatus(@PathVariable Long id, @RequestBody UpdateUserStatusRequest request) {
        adminAppService.modifyUserStatus(id, request.getStatus());
        return Result.success();
    }

    @PostMapping("/user/batch/disable")
    public Result<Void> batchDisableUser(@RequestBody AdminBatchDisableUserRequest request) {
        adminAppService.batchDisableUser(request.getUserIds());
        return Result.success();
    }

    @GetMapping("/skill/list")
    public Result<AdminPageResponse<AdminSkillItemResponse>> getSkillList(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.success(adminAppService.getSkillList(category, keyword, page, pageSize));
    }

    @PostMapping("/skill-tags")
    public Result<SkillTag> createSkillTag(@RequestBody AdminSkillTagUpsertRequest request) {
        return Result.success(adminAppService.createSkillTag(request));
    }

    @PutMapping("/skill-tags/{id}")
    public Result<SkillTag> updateSkillTag(@PathVariable Long id, @RequestBody AdminSkillTagUpsertRequest request) {
        return Result.success(adminAppService.updateSkillTag(id, request));
    }

    @DeleteMapping("/skill-tags/{id}")
    public Result<Void> deleteSkillTag(@PathVariable Long id) {
        adminAppService.deleteSkillTag(id);
        return Result.success();
    }

    @PostMapping("/skill-tags/{id}/synonyms")
    public Result<SkillTag> addSkillTagSynonym(@PathVariable Long id, @RequestParam String synonym) {
        return Result.success(adminAppService.addSkillTagSynonym(id, synonym));
    }

    @DeleteMapping("/skill-tags/{id}/synonyms/{synonym}")
    public Result<Void> removeSkillTagSynonym(@PathVariable Long id, @PathVariable String synonym) {
        adminAppService.removeSkillTagSynonym(id, synonym);
        return Result.success();
    }

    
    @GetMapping("/industry/list")
    public Result<AdminPageResponse<AdminIndustryItemResponse>> getIndustryList(
            @RequestParam(required = false) Integer enabled,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.success(adminAppService.getIndustryList(enabled, keyword, sortBy, sortDir, page, pageSize));
    }

    @GetMapping("/industry/tree")
    public Result<java.util.List<AdminIndustryItemResponse>> getIndustryTree(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer enabled,
            @RequestParam(required = false) Integer level) {
        return Result.success(adminAppService.getIndustryTree(keyword, enabled, level));
    }

    @PostMapping("/industry")
    public Result<AdminIndustryItemResponse> createIndustry(@RequestBody AdminIndustryCreateRequest request) {
        return Result.success(adminAppService.createIndustry(request.getName(), request.getParentId(), request.getEnabled(), request.getSort()));
    }

    @PutMapping("/industry/{id}")
    public Result<AdminIndustryItemResponse> updateIndustry(@PathVariable Long id, @RequestBody AdminIndustryUpdateRequest request) {
        return Result.success(adminAppService.updateIndustry(id, request.getName(), request.getSort()));
    }

    @PutMapping("/industry/{id}/status")
    public Result<AdminIndustryItemResponse> updateIndustryStatus(@PathVariable Long id, @RequestBody AdminIndustryStatusUpdateRequest request) {
        return Result.success(adminAppService.updateIndustryStatus(id, request.getEnabled()));
    }

    @PutMapping("/industry/{id}/move")
    public Result<AdminIndustryItemResponse> moveIndustry(@PathVariable Long id, @RequestBody AdminIndustryMoveRequest request) {
        return Result.success(adminAppService.moveIndustry(id, request.getDirection()));
    }

    @DeleteMapping("/industry/{id}")
    public Result<Void> deleteIndustry(@PathVariable Long id) {
        adminAppService.deleteIndustry(id);
        return Result.success();
    }

    @PostMapping("/position-type-skill-profile/bootstrap")
    public Result<Integer> bootstrapIndustrySkillProfiles() {
        return Result.success(industrySkillProfileBootstrapService.bootstrapAllLeafIndustries());
    }

    @PostMapping("/position-type-skill-profile/bootstrap/{positionTypeId}")
    public Result<Void> bootstrapIndustrySkillProfileByIndustry(@PathVariable Long positionTypeId) {
        industrySkillProfileBootstrapService.bootstrapByPositionTypeId(positionTypeId);
        return Result.success();
    }

    @GetMapping("/position-type/tree")
    public Result<java.util.List<AdminPositionTypeTreeItemResponse>> getPositionTypeTree(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer level) {
        return Result.success(adminAppService.getPositionTypeTree(keyword, status, level));
    }

    @PostMapping("/position-type")
    public Result<AdminPositionTypeTreeItemResponse> createPositionType(@RequestBody AdminPositionTypeCreateRequest request) {
        return Result.success(adminAppService.createPositionType(request.getName(), request.getParentId(), request.getStatus()));
    }

    @PutMapping("/position-type/{id}")
    public Result<AdminPositionTypeTreeItemResponse> updatePositionType(@PathVariable Long id, @RequestBody AdminPositionTypeUpdateRequest request) {
        return Result.success(adminAppService.updatePositionType(id, request.getName()));
    }

    @PutMapping("/position-type/{id}/status")
    public Result<AdminPositionTypeTreeItemResponse> updatePositionTypeStatus(@PathVariable Long id, @RequestBody AdminPositionTypeStatusUpdateRequest request) {
        return Result.success(adminAppService.updatePositionTypeStatus(id, request.getStatus()));
    }

    @PutMapping("/position-type/{id}/move")
    public Result<AdminPositionTypeTreeItemResponse> movePositionType(@PathVariable Long id, @RequestBody AdminPositionTypeMoveRequest request) {
        return Result.success(adminAppService.movePositionType(id, request.getDirection()));
    }

    @GetMapping("/task/list")
    public Result<AdminTaskListResponse> getTaskList(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return Result.success(adminAppService.getTaskList(type, status, page, pageSize));
    }

    @PostMapping("/task/{id}/retry")
    public Result<Void> retryTask(@PathVariable Long id) {
        adminAppService.retryTask(id);
        return Result.success();
    }

    @PostMapping("/task/batch/retry")
    public Result<Void> batchRetryTask(@RequestBody AdminBatchRetryTaskRequest request) {
        adminAppService.batchRetryTask(request.getTaskIds());
        return Result.success();
    }
}


