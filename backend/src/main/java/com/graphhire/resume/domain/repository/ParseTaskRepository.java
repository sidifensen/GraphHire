package com.graphhire.resume.domain.repository;

import com.graphhire.resume.domain.model.ParseTask;
import java.util.Optional;

public interface ParseTaskRepository {
    Optional<ParseTask> findById(Long id);
    Optional<ParseTask> findByResumeId(Long resumeId);
    ParseTask save(ParseTask parseTask);
    void delete(ParseTask parseTask);
}
