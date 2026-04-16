package com.graphhire.resume.domain.event;

import com.graphhire.common.model.BaseAggregateRoot.DomainEvent;
import com.graphhire.resume.domain.model.Resume;

/**
 * 简历上传领域事件
 * 当简历上传成功时发布，触发后续解析流程
 */
public class ResumeUploadedEvent extends DomainEvent {
    /** 关联的简历实体 */
    private final Resume resume;

    public ResumeUploadedEvent(Resume resume) {
        this.resume = resume;
    }

    public Resume getResume() {
        return resume;
    }
}
