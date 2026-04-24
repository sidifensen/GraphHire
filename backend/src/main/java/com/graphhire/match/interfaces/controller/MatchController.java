package com.graphhire.match.interfaces.controller;

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

    /**
     * 触发匹配
     * @param cmd 匹配请求
     * @return 匹配结果
     */
    @PostMapping("/trigger")
    public Result<MatchRecord> triggerMatch(@RequestBody TriggerMatchCmd cmd) {
        MatchRecord record = matchAppService.triggerMatch(cmd);
        return Result.success(record);
    }

    /**
     * 按需触发匹配（点击岗位时调用）
     * @param cmd 匹配请求
     * @return 匹配结果
     */
    @PostMapping("/on-demand")
    public Result<MatchRecord> triggerOnDemandMatch(@RequestBody TriggerMatchCmd cmd) {
        MatchRecord record = matchAppService.triggerMatch(cmd);
        return Result.success(record);
    }

    /**
     * 获取匹配详情
     * @param matchId 匹配记录ID
     * @return 匹配详情
     */
    @GetMapping("/{matchId}/detail")
    public Result<MatchDetailResponse> getMatchDetail(@PathVariable Long matchId) {
        MatchDetailQuery query = new MatchDetailQuery(matchId);
        return Result.success(matchAppService.getMatchDetail(query));
    }

    /**
     * 获取简历的匹配列表
     * @param resumeId 简历ID
     * @return 匹配列表
     */
    @GetMapping("/resume/{resumeId}/list")
    public Result<List<MatchDetailResponse>> getMatchListForResume(@PathVariable Long resumeId) {
        return Result.success(matchAppService.getMatchListForResume(resumeId));
    }

    /**
     * 获取职位的匹配列表
     * @param jobId 职位ID
     * @return 匹配列表
     */
    @GetMapping("/job/{jobId}/list")
    public Result<List<MatchDetailResponse>> getMatchListForJob(@PathVariable Long jobId) {
        return Result.success(matchAppService.getMatchListForJob(jobId));
    }
}
