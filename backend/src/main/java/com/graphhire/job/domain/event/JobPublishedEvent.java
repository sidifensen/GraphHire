package com.graphhire.job.domain.event;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.job.domain.model.Job;

public class JobPublishedEvent extends BaseAggregateRoot.DomainEvent {
    private final Job job;

    public JobPublishedEvent(Job job) {
        this.job = job;
    }

    public Job getJob() {
        return job;
    }
}
