package com.graphhire.match.application.query;

public class MatchDetailQuery {
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
