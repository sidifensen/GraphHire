package com.graphhire.application.domain.repository;

import com.graphhire.application.domain.model.Application;
import com.graphhire.application.domain.model.ApplicationStatus;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository {
    Application save(Application application);
    Optional<Application> findById(Long id);
    List<Application> findByUserId(Long userId);
    List<Application> findByJobId(Long jobId);
    List<Application> findByCompanyId(Long companyId);
    List<Application> findByCompanyIdAndStatus(Long companyId, ApplicationStatus status);
    Optional<Application> findByResumeIdAndJobId(Long resumeId, Long jobId);
    boolean existsByResumeIdAndJobId(Long resumeId, Long jobId);
    void delete(Long id);
}
