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

@RestController
@RequestMapping("/match")
public class MatchController {

    @Autowired
    private MatchAppService matchAppService;

    @PostMapping("/trigger")
    public Result<MatchRecord> triggerMatch(@RequestBody TriggerMatchCmd cmd) {
        MatchRecord record = matchAppService.triggerMatch(cmd);
        return Result.success(record);
    }

    @GetMapping("/{matchId}/detail")
    public Result<MatchDetailResponse> getMatchDetail(@PathVariable Long matchId) {
        MatchDetailQuery query = new MatchDetailQuery(matchId);
        return Result.success(matchAppService.getMatchDetail(query));
    }

    @GetMapping("/resume/{resumeId}/list")
    public Result<List<MatchDetailResponse>> getMatchListForResume(@PathVariable Long resumeId) {
        return Result.success(matchAppService.getMatchListForResume(resumeId));
    }

    @GetMapping("/job/{jobId}/list")
    public Result<List<MatchDetailResponse>> getMatchListForJob(@PathVariable Long jobId) {
        return Result.success(matchAppService.getMatchListForJob(jobId));
    }
}
