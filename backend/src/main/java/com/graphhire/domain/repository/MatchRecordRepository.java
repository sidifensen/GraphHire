package com.graphhire.domain.repository;

import com.graphhire.domain.model.MatchRecord;

import java.util.List;
import java.util.Optional;

public interface MatchRecordRepository {
    MatchRecord findById(Long id);
    Optional<MatchRecord> findByIdOptional(Long id);
    List<MatchRecord> findByResumeId(Long resumeId);
    List<MatchRecord> findByJobId(Long jobId);
    MatchRecord save(MatchRecord record);
}
