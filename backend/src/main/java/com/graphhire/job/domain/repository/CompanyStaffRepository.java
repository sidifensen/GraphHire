package com.graphhire.job.domain.repository;

import com.graphhire.job.domain.model.CompanyStaff;

import java.util.List;
import java.util.Optional;

public interface CompanyStaffRepository {
    Optional<CompanyStaff> findByUserId(Long userId);

    List<CompanyStaff> findByCompanyId(Long companyId);

    CompanyStaff save(CompanyStaff companyStaff);

    void delete(CompanyStaff companyStaff);
}