package com.graphhire.web.controller;

import com.graphhire.web.dto.response.ApiResponse;
import com.graphhire.web.dto.response.JobDetailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/job")
public class JobController {

    @Autowired
    private Object jobService;

    @GetMapping("/published/list")
    public ApiResponse<List<JobDetailResponse>> getPublishedJobList(@RequestParam(required = false) Integer page,
                                                                     @RequestParam(required = false) Integer size) {
        // TODO: Implement get published job list logic
        return ApiResponse.success();
    }

    @GetMapping("/{id}/detail")
    public ApiResponse<JobDetailResponse> getJobDetail(@PathVariable Long id) {
        // TODO: Implement get job detail logic
        return ApiResponse.success();
    }
}
