package com.graphhire.common.model;

import java.util.ArrayList;
import java.util.List;

/**
 * 聚合根基类
 * 【模块说明】提供领域事件注册与提取机制，确保聚合内所有状态变更通过事件驱动
 * 【事件发布】pullDomainEvents() 提取并清空事件队列
 */
public abstract class BaseAggregateRoot {
    /** 存储领域事件的列表 */
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    /**
     * 注册领域事件
     * @param event 待注册的事件对象
     */
    protected void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    /**
     * 提取并清空所有领域事件
     * @return 已注册事件的快照列表
     */
    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = new ArrayList<>(domainEvents);
        domainEvents.clear();
        return events;
    }

    /** 领域事件基类，子类可继承扩展具体事件 */
    public static class DomainEvent {
    }
}
