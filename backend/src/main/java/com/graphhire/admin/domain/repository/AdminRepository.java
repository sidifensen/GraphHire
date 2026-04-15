package com.graphhire.admin.domain.repository;

import java.util.Optional;

/**
 * Admin repository interface for domain layer.
 */
public interface AdminRepository {

    /**
     * Count persons (users with type PERSON).
     */
    long countPersons();

    /**
     * Count companies (users with type COMPANY).
     */
    long countCompanies();

    /**
     * Count resumes.
     */
    long countResumes();

    /**
     * Count published jobs.
     */
    long countPublishedJobs();

    /**
     * Count match records.
     */
    long countMatchRecords();

    /**
     * Find user by ID.
     */
    Optional<Long> findUserIdById(Long id);
}
