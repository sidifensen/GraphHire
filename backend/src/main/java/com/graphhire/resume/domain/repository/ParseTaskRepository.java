package com.graphhire.resume.domain.repository;

import com.graphhire.resume.domain.model.ParseTask;
import com.baomidou.mybatisplus.core.metadata.IPage;
import java.util.List;
import java.util.Optional;

public interface ParseTaskRepository {
    Optional<ParseTask> findById(Long id);
    Optional<ParseTask> findByResumeId(Long resumeId);
    List<ParseTask> findAll();
    IPage<ParseTask> findPage(String type, String status, int page, int pageSize);
    long countByStatus(ParseTask.TaskStatus status);
    ParseTask save(ParseTask parseTask);
    void delete(ParseTask parseTask);
}
