package com.graphhire.domain.repository;

import com.graphhire.domain.model.Company;
import com.graphhire.domain.vo.AuthStatus;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository {
    Company findById(Long id);
    Optional<Company> findByIdOptional(Long id);
    Company findByUserId(Long userId);
    Optional<Company> findByUserIdOptional(Long userId);
    Company save(Company company);
    List<Company> findByAuthStatus(AuthStatus status);
    List<Company> findByAuthStatus(AuthStatus status, Integer page, Integer pageSize);
    Long countByAuthStatus(AuthStatus status);
}
