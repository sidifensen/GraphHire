package com.graphhire.domain.repository;

import com.graphhire.domain.model.ParseTask;
import com.graphhire.domain.vo.TaskStatus;

import java.util.List;
import java.util.Optional;

public interface ParseTaskRepository {
    ParseTask findById(Long id);
    Optional<ParseTask> findByIdOptional(Long id);
    ParseTask save(ParseTask task);
    List<ParseTask> findByStatus(TaskStatus status);
    List<ParseTask> findPendingTasks(int limit);
    List<ParseTask> findByResumeId(Long resumeId);
    List<ParseTask> findByJobId(Long jobId);
    void delete(Long id);
    Long countPending();
}
