package com.graphhire.domain.repository;

import com.graphhire.domain.model.Job;
import com.graphhire.domain.vo.JobStatus;

import java.util.List;
import java.util.Optional;

public interface JobRepository {
    Job findById(Long id);
    Optional<Job> findByIdOptional(Long id);
    List<Job> findByCompanyId(Long companyId);
    List<Job> findByCompanyId(Long companyId, Integer page, Integer pageSize);
    List<Job> findByJobStatus(JobStatus status);
    List<Job> findByJobStatus(JobStatus status, Integer page, Integer pageSize);
    Job save(Job job);
    List<Job> findPublishedJobs();
    List<Job> findByKeyword(String keyword, Integer page, Integer pageSize);
    Long countByKeyword(String keyword);
    Long countAll();
    Long countByCompanyId(Long companyId);
    Long countByJobStatus(JobStatus status);
    void delete(Long id);
}
