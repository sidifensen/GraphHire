package com.graphhire.web.controller;

import com.graphhire.web.dto.request.AuthCompanyRequest;
import com.graphhire.web.dto.response.ApiResponse;
import com.graphhire.web.dto.response.DashboardStatsResponse;
import com.graphhire.web.dto.response.CompanyProfileResponse;
import com.graphhire.web.dto.response.JobDetailResponse;
import com.graphhire.web.dto.response.ResumeDetailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private Object adminService;

    @GetMapping("/user/list")
    public ApiResponse<List<Object>> getUserList(@RequestParam(required = false) Integer page,
                                                   @RequestParam(required = false) Integer size) {
        // TODO: Implement get user list logic
        return ApiResponse.success();
    }

    @PutMapping("/user/{id}/enable")
    public ApiResponse<Void> enableUser(@PathVariable Long id) {
        // TODO: Implement enable user logic
        return ApiResponse.success();
    }

    @PutMapping("/user/{id}/disable")
    public ApiResponse<Void> disableUser(@PathVariable Long id) {
        // TODO: Implement disable user logic
        return ApiResponse.success();
    }

    @GetMapping("/company/pending-list")
    public ApiResponse<List<CompanyProfileResponse>> getPendingCompanyList() {
        // TODO: Implement get pending company list logic
        return ApiResponse.success();
    }

    @PutMapping("/company/{id}/auth")
    public ApiResponse<Void> authCompany(@PathVariable Long id, @RequestBody AuthCompanyRequest request) {
        // TODO: Implement auth company logic
        return ApiResponse.success();
    }

    @GetMapping("/resume/list")
    public ApiResponse<List<ResumeDetailResponse>> getResumeList(@RequestParam(required = false) Integer page,
                                                                   @RequestParam(required = false) Integer size) {
        // TODO: Implement get resume list logic
        return ApiResponse.success();
    }

    @DeleteMapping("/resume/{id}")
    public ApiResponse<Void> deleteResume(@PathVariable Long id) {
        // TODO: Implement delete resume logic
        return ApiResponse.success();
    }

    @GetMapping("/job/list")
    public ApiResponse<List<JobDetailResponse>> getJobList(@RequestParam(required = false) Integer page,
                                                             @RequestParam(required = false) Integer size) {
        // TODO: Implement get job list logic
        return ApiResponse.success();
    }

    @DeleteMapping("/job/{id}")
    public ApiResponse<Void> deleteJob(@PathVariable Long id) {
        // TODO: Implement delete job logic
        return ApiResponse.success();
    }

    @GetMapping("/dashboard/stats")
    public ApiResponse<DashboardStatsResponse> getDashboardStats() {
        // TODO: Implement get dashboard stats logic
        return ApiResponse.success();
    }
}
