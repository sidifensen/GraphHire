package com.graphhire.application.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.application.application.service.ApplicationAppService;
import com.graphhire.application.domain.model.Application;
import com.graphhire.application.domain.model.Favorite;
import com.graphhire.application.interfaces.dto.response.PersonApplicationListItemResponse;
import com.graphhire.common.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/person/application")
public class PersonApplicationController {

    @Autowired
    private ApplicationAppService applicationAppService;

    @PostMapping("/apply")
    public Result<Long> applyJob(@RequestBody Map<String, Long> request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long resumeId = request.get("resumeId");
        Long jobId = request.get("jobId");
        Application application = applicationAppService.applyJob(userId, resumeId, jobId);
        return Result.success(application.getId());
    }

    @GetMapping("/list")
    public Result<List<PersonApplicationListItemResponse>> getMyApplications() {
        Long userId = StpUtil.getLoginIdAsLong();
        return Result.success(applicationAppService.getUserApplicationList(userId));
    }

    @GetMapping("/{id}")
    public Result<Application> getApplicationDetail(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        Application application = applicationAppService.getApplicationById(id);
        if (!application.getUserId().equals(userId)) {
            throw new RuntimeException("无权查看此投递");
        }
        return Result.success(application);
    }

    @PutMapping("/{id}/withdraw")
    public Result<Void> withdrawApplication(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        applicationAppService.withdrawApplication(userId, id);
        return Result.success();
    }

    @PostMapping("/favorite")
    public Result<Void> favoriteJob(@RequestBody Map<String, Long> request) {
        Long userId = StpUtil.getLoginIdAsLong();
        Long jobId = request.get("jobId");
        applicationAppService.favoriteJob(userId, jobId);
        return Result.success();
    }

    @DeleteMapping("/favorite/{jobId}")
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
