package com.graphhire.job.domain.event;

import com.graphhire.common.model.BaseAggregateRoot;
import com.graphhire.job.domain.model.Job;

/**
 * 职位发布领域事件
 *
 * 【模块说明】当职位从草稿或关闭状态发布为已发布状态时发布此事件。
 *            用于触发后续业务流程，如：通知匹配系统、更新推荐队列等。
 */
public class JobPublishedEvent extends BaseAggregateRoot.DomainEvent {
    /** 发布成功的职位实体 */
    private final Job job;

    public JobPublishedEvent(Job job) {
        this.job = job;
    }

    public Job getJob() {
        return job;
    }
}
