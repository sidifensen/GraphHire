package com.graphhire.match.application.query;

/**
 * 匹配详情查询
 * 用于查询指定匹配记录的详细信息
 */
public class MatchDetailQuery {
    /** 匹配记录ID */
    private Long matchId;

    public MatchDetailQuery() {
    }

    public MatchDetailQuery(Long matchId) {
        this.matchId = matchId;
    }

    public Long getMatchId() {
        return matchId;
    }
}
