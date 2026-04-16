package com.graphhire.admin.domain.repository;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.graphhire.auth.domain.model.User;

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

    /**
     * Find users with pagination.
     */
    IPage<User> findUsersPage(int page, int size);
}
