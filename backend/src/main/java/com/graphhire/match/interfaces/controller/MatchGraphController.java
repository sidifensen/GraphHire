package com.graphhire.match.interfaces.controller;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.collection.CollUtil;
import com.graphhire.common.vo.Result;
import com.graphhire.match.domain.service.MatchGraphService;
import com.graphhire.match.interfaces.vo.GraphMatchVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 基于能力图谱的匹配接口
 * 提供人岗匹配的技能图谱评分功能
 */
@RestController
@RequestMapping("/match")
public class MatchGraphController {

    private static final Logger log = LoggerFactory.getLogger(MatchGraphController.class);

    @Autowired
    private MatchGraphService matchGraphService;

    /**
     * 获取用户与职位的技能图谱匹配分数
     * @param personId 用户ID
     * @param jobId 职位ID
     * @return 匹配结果
     */
    @GetMapping("/person/{personId}/job/{jobId}/graph-score")
    public Result<GraphMatchVO> getGraphMatchScore(@PathVariable Long personId, @PathVariable Long jobId) {
        try {
            // 校验登录状态，确保只能查看自己的匹配
            Long currentUserId = StpUtil.getLoginIdAsLong();
            if (!currentUserId.equals(personId)) {
                return Result.error(403, "无权查看该用户的匹配结果");
            }

            GraphMatchVO result = matchGraphService.calculateGraphMatchScore(personId, jobId);
            return Result.success(result);
        } catch (IllegalArgumentException e) {
            log.warn("获取匹配分数参数错误: {}", e.getMessage());
            return Result.error(400, e.getMessage());
        } catch (Exception e) {
            log.error("获取匹配分数异常: personId={}, jobId={}", personId, jobId, e);
            return Result.error(500, "获取匹配分数失败: " + e.getMessage());
        }
    }
}
