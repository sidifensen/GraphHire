package com.graphhire.job.domain.repository;

import com.graphhire.job.domain.model.Company;
import com.graphhire.auth.domain.vo.AuthStatus;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository {
    Optional<Company> findById(Long id);

    Optional<Company> findByUnifiedSocialCreditCode(String unifiedSocialCreditCode);

    List<Company> findByAuthStatus(AuthStatus authStatus);

    Company save(Company company);

    void delete(Company company);

    long countByAuthStatus(AuthStatus authStatus);
}
