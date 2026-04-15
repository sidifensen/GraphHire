package com.graphhire.resume.domain.service;

import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.vo.ParseStatus;
import org.springframework.stereotype.Service;

@Service
public class ResumeDomainService {

    public boolean isParsable(Resume resume) {
        return resume.getStatus() == ParseStatus.PENDING ||
               (resume.getStatus() == ParseStatus.FAILED && resume.canRetry());
    }

    public boolean shouldTriggerMatch(Resume resume) {
        return resume.getStatus() == ParseStatus.SUCCESS;
    }
}
