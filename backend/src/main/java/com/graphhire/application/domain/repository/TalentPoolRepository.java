package com.graphhire.application.domain.repository;

import com.graphhire.application.domain.model.TalentPool;
import java.util.List;
import java.util.Optional;

public interface TalentPoolRepository {
    TalentPool save(TalentPool talentPool);
    Optional<TalentPool> findById(Long id);
    List<TalentPool> findByCompanyId(Long companyId);
    Optional<TalentPool> findByCompanyIdAndResumeId(Long companyId, Long resumeId);
    boolean existsByCompanyIdAndResumeId(Long companyId, Long resumeId);
    void delete(Long id);
    void deleteByCompanyIdAndResumeId(Long companyId, Long resumeId);
}
