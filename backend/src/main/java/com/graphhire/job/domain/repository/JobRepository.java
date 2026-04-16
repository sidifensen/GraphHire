package com.graphhire.job.domain.repository;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.vo.JobStatus;

import java.util.List;
import java.util.Optional;

public interface JobRepository {
    Optional<Job> findById(Long id);

    List<Job> findByCompanyId(Long companyId);

    List<Job> findByStatus(JobStatus status);

    List<Job> findAll();

    Job save(Job job);

    void delete(Job job);

    long countByStatus(JobStatus status);
}
