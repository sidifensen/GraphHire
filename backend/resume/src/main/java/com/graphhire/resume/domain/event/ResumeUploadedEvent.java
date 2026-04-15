package com.graphhire.resume.domain.event;

import com.graphhire.resume.domain.model.Resume;

public class ResumeUploadedEvent extends DomainEvent {
    private final Resume resume;

    public ResumeUploadedEvent(Resume resume) {
        this.resume = resume;
    }

    public Resume getResume() {
        return resume;
    }
}
