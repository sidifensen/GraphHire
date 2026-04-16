package com.graphhire.application.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.application.application.service.ApplicationAppService;
import com.graphhire.application.domain.model.Application;
import com.graphhire.application.domain.model.Favorite;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/person")
public class PersonApplicationController {

    @Autowired
    private ApplicationAppService applicationAppService;

    @PostMapping("/applications")
    public Result<Long> applyJob(@RequestBody Map<String, Long> request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long resumeId = request.get("resumeId");
        Long jobId = request.get("jobId");
        Application application = applicationAppService.applyJob(userId, resumeId, jobId);
        return Result.success(application.getId());
    }

    @GetMapping("/applications")
    public Result<List<Application>> getMyApplications() {
        Long userId = StpUtil.getLoginIdAsLong();
        return Result.success(applicationAppService.getUserApplications(userId));
    }

    @GetMapping("/applications/{id}")
    public Result<Application> getApplicationDetail(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Application application = applicationAppService.getApplicationById(id);
        if (!application.getUserId().equals(userId)) {
            throw new RuntimeException("无权查看此投递");
        }
        return Result.success(application);
    }

    @PutMapping("/applications/{id}/withdraw")
    public Result<Void> withdrawApplication(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        applicationAppService.withdrawApplication(userId, id);
        return Result.success();
    }

    @PostMapping("/favorites")
    public Result<Void> favoriteJob(@RequestBody Map<String, Long> request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long jobId = request.get("jobId");
        applicationAppService.favoriteJob(userId, jobId);
        return Result.success();
    }

    @DeleteMapping("/favorites/{jobId}")
    public Result<Void> unfavoriteJob(@PathVariable Long jobId) {
        Long userId = StpUtil.getLoginIdAsLong();
        applicationAppService.unfavoriteJob(userId, jobId);
        return Result.success();
    }

    @GetMapping("/favorites")
    public Result<List<Favorite>> getMyFavorites() {
        Long userId = StpUtil.getLoginIdAsLong();
        return Result.success(applicationAppService.getUserFavorites(userId));
    }
}