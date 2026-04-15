package com.graphhire.match.domain.model;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.match.domain.event.MatchCompletedEvent;
import com.graphhire.match.domain.vo.MatchLevel;
import com.graphhire.match.domain.vo.MatchScore;

public class MatchRecord extends BaseAggregateRoot {
    private Long id;
    private Long resumeId;
    private Long jobId;
    private MatchScore score;
    private MatchLevel level;
    private String matchReason;
    private Boolean isRead = false;

    public static MatchRecord create(Long resumeId, Long jobId, MatchScore score) {
        MatchRecord record = new MatchRecord();
        record.resumeId = resumeId;
        record.jobId = jobId;
        record.score = score;
        record.level = score.getLevel();
        record.registerEvent(new MatchCompletedEvent(record));
        return record;
    }

    public void markAsRead() {
        this.isRead = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public Long getJobId() {
        return jobId;
    }

    public MatchScore getScore() {
        return score;
    }

    public MatchLevel getLevel() {
        return level;
    }

    public String getMatchReason() {
        return matchReason;
    }

    public void setMatchReason(String matchReason) {
        this.matchReason = matchReason;
    }

    public Boolean getIsRead() {
        return isRead;
    }
}
