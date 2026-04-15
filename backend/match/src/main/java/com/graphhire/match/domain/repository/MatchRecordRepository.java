package com.graphhire.match.domain.repository;

import com.graphhire.match.domain.model.MatchRecord;

import java.util.List;
import java.util.Optional;

public interface MatchRecordRepository {
    Optional<MatchRecord> findById(Long id);
    List<MatchRecord> findByResumeId(Long resumeId);
    List<MatchRecord> findByJobId(Long jobId);
    List<MatchRecord> findByResumeIdAndJobId(Long resumeId, Long jobId);
    MatchRecord save(MatchRecord matchRecord);
    void delete(MatchRecord matchRecord);
    long count();
}
