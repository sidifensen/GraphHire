package com.graphhire.match.domain.service;

import com.graphhire.match.interfaces.vo.GraphMatchVO;

/**
 * 技能图谱匹配服务接口
 * 定义基于能力图谱的人岗匹配计算逻辑
 */
public interface MatchGraphService {

    /**
     * 计算用户与职位的技能图谱匹配分数
     * @param personId 用户ID
     * @param jobId 职位ID
     * @return 匹配结果
     */
    GraphMatchVO calculateGraphMatchScore(Long personId, Long jobId);
}
