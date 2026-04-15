package com.graphhire.match.domain.event;

import com.graphhire.match.domain.model.MatchRecord;

public class MatchCompletedEvent extends com.graphhire.common.model.BaseAggregateRoot.DomainEvent {
    private final MatchRecord matchRecord;

    public MatchCompletedEvent(MatchRecord matchRecord) {
        this.matchRecord = matchRecord;
    }

    public MatchRecord getMatchRecord() {
        return matchRecord;
    }
}
