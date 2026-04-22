package com.graphhire.resume.domain.event;

import com.graphhire.common.model.BaseAggregateRoot.DomainEvent;
import com.graphhire.resume.domain.model.Resume;

import java.io.Serializable;

/**
 * 简历解析完成领域事件
 * 当简历解析成功时发布，触发技能图谱构建等后续流程
 */
public class ResumeParsedEvent extends DomainEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 关联的简历实体 */
    private final Resume resume;

    public ResumeParsedEvent(Resume resume) {
        this.resume = resume;
    }

    public Resume getResume() {
        return resume;
    }
}
