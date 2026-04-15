package com.graphhire.web.controller;

import com.graphhire.web.dto.request.SkillTagRequest;
import com.graphhire.web.dto.response.ApiResponse;
import com.graphhire.web.dto.response.SkillTagResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skill-tag")
public class SkillTagController {

    @Autowired
    private Object skillTagService;

    @GetMapping("/list")
    public ApiResponse<List<SkillTagResponse>> getAllSkillTags() {
        // TODO: Implement get all skill tags logic
        return ApiResponse.success();
    }

    @GetMapping("/list/{category}")
    public ApiResponse<List<SkillTagResponse>> getSkillTagsByCategory(@PathVariable String category) {
        // TODO: Implement get skill tags by category logic
        return ApiResponse.success();
    }

    @PostMapping
    public ApiResponse<Long> createSkillTag(@RequestBody SkillTagRequest request) {
        // TODO: Implement create skill tag logic
        return ApiResponse.success();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateSkillTag(@PathVariable Long id, @RequestBody SkillTagRequest request) {
        // TODO: Implement update skill tag logic
        return ApiResponse.success();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSkillTag(@PathVariable Long id) {
        // TODO: Implement delete skill tag logic
        return ApiResponse.success();
    }
}
