package com.graphhire.domain.repository;

import com.graphhire.domain.model.CompanyStaff;

import java.util.List;

public interface CompanyStaffRepository {
    CompanyStaff findByUserId(Long userId);
    List<CompanyStaff> findByCompanyId(Long companyId);
    CompanyStaff save(CompanyStaff staff);
}
