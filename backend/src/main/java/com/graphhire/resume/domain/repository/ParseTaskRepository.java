package com.graphhire.resume.domain.repository;

import com.graphhire.resume.domain.model.ParseTask;
import java.util.List;
import java.util.Optional;

public interface ParseTaskRepository {
    Optional<ParseTask> findById(Long id);
    Optional<ParseTask> findByResumeId(Long resumeId);
    List<ParseTask> findAll();
    ParseTask save(ParseTask parseTask);
    void delete(ParseTask parseTask);
}
