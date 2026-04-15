package com.graphhire.resume.domain.event;

import com.graphhire.resume.domain.model.Resume;

public class ResumeParsedEvent extends DomainEvent {
    private final Resume resume;

    public ResumeParsedEvent(Resume resume) {
        this.resume = resume;
    }

    public Resume getResume() {
        return resume;
    }
}
