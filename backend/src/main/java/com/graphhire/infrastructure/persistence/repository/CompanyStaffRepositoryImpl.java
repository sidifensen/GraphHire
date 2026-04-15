package com.graphhire.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.domain.model.CompanyStaff;
import com.graphhire.domain.repository.CompanyStaffRepository;
import com.graphhire.infrastructure.persistence.mapper.CompanyStaffMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CompanyStaffRepositoryImpl implements CompanyStaffRepository {
    private final CompanyStaffMapper companyStaffMapper;

    @Override
    public CompanyStaff findByUserId(Long userId) {
        return companyStaffMapper.selectOne(new LambdaQueryWrapper<CompanyStaff>().eq(CompanyStaff::getUserId, userId));
    }

    @Override
    public List<CompanyStaff> findByCompanyId(Long companyId) {
        return companyStaffMapper.selectList(new LambdaQueryWrapper<CompanyStaff>().eq(CompanyStaff::getCompanyId, companyId));
    }

    @Override
    public CompanyStaff save(CompanyStaff staff) {
        if (staff.getId() == null) {
            companyStaffMapper.insert(staff);
        } else {
            companyStaffMapper.updateById(staff);
        }
        return staff;
    }
}
