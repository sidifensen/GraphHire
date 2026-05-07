package com.graphhire.match.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.graphhire.auth.domain.model.User;
import com.graphhire.auth.domain.repository.UserRepository;
import com.graphhire.auth.domain.vo.UserType;
import com.graphhire.common.vo.Exceptions;
import com.graphhire.common.vo.Result;
import com.graphhire.match.application.command.TriggerMatchCmd;
import com.graphhire.match.application.query.MatchDetailQuery;
import com.graphhire.match.application.service.MatchAppService;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.interfaces.dto.response.MatchDetailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 匹配记录接口
 * 提供职位与简历匹配结果的查询和触发功能
 */
@RestController
@RequestMapping("/match")
public class MatchController {

    @Autowired
    private MatchAppService matchAppService;
    @Autowired
    private UserRepository userRepository;

    /**
     * 触发匹配
     * @param cmd 匹配请求
     * @return 匹配结果
     */
    @PostMapping("/trigger")
    public Result<MatchRecord> triggerMatch(@RequestBody TriggerMatchCmd cmd) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        UserType userType = currentUserType(currentUserId);
        MatchRecord record = matchAppService.triggerMatchForCurrentUser(currentUserId, userType, cmd);
        return Result.success(record);
    }

    /**
     * 按需触发匹配（点击岗位时调用）
     * @param cmd 匹配请求
     * @return 匹配结果
     */
    @PostMapping("/on-demand")
    public Result<MatchRecord> triggerOnDemandMatch(@RequestBody TriggerMatchCmd cmd) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        UserType userType = currentUserType(currentUserId);
        MatchRecord record = matchAppService.triggerMatchForCurrentUser(currentUserId, userType, cmd);
        return Result.success(record);
    }

    /**
     * 获取匹配详情
     * @param matchId 匹配记录ID
     * @return 匹配详情
     */
    @GetMapping("/{matchId}/detail")
    public Result<MatchDetailResponse> getMatchDetail(@PathVariable Long matchId) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        UserType userType = currentUserType(currentUserId);
        return Result.success(matchAppService.getMatchDetailForCurrentUser(currentUserId, userType, matchId));
    }

    /**
     * 获取简历的匹配列表
     * @param resumeId 简历ID
     * @return 匹配列表
     */
    @GetMapping("/resume/{resumeId}/list")
    public Result<List<MatchDetailResponse>> getMatchListForResume(@PathVariable Long resumeId) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        UserType userType = currentUserType(currentUserId);
        return Result.success(matchAppService.getMatchListForResumeCurrentUser(currentUserId, userType, resumeId));
    }

    /**
     * 获取职位的匹配列表
     * @param jobId 职位ID
     * @return 匹配列表
     */
    @GetMapping("/job/{jobId}/list")
    public Result<List<MatchDetailResponse>> getMatchListForJob(@PathVariable Long jobId) {
        Long currentUserId = StpUtil.getLoginIdAsLong();
        UserType userType = currentUserType(currentUserId);
        return Result.success(matchAppService.getMatchListForJobCurrentUser(currentUserId, userType, jobId));
    }

    private UserType currentUserType(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new Exceptions.UnauthorizedException("登录用户不存在"));
        return user.getUserType();
    }
}
