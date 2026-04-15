package com.graphhire.web.controller;

import com.graphhire.web.dto.response.ApiResponse;
import com.graphhire.web.dto.response.MatchDetailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/match")
public class MatchController {

    @Autowired
    private Object matchService;

    @GetMapping("/record/{id}/detail")
    public ApiResponse<MatchDetailResponse> getMatchDetail(@PathVariable Long id) {
        // TODO: Implement get match detail logic
        return ApiResponse.success();
    }

    @PutMapping("/record/{id}/read")
    public ApiResponse<Void> markMatchRead(@PathVariable Long id) {
        // TODO: Implement mark match read logic
        return ApiResponse.success();
    }
}
