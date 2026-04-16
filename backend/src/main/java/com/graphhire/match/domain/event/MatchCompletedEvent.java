package com.graphhire.match.domain.event;

import com.graphhire.match.domain.model.MatchRecord;

/**
 * 匹配完成领域事件
 * 当人岗匹配计算完成后发布，通知相关方匹配结果
 */
public class MatchCompletedEvent extends com.graphhire.common.model.BaseAggregateRoot.DomainEvent {
    /** 匹配记录实体 */
    private final MatchRecord matchRecord;

    public MatchCompletedEvent(MatchRecord matchRecord) {
        this.matchRecord = matchRecord;
    }

    public MatchRecord getMatchRecord() {
        return matchRecord;
    }
}
