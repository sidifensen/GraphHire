package com.graphhire.job.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import com.graphhire.job.infrastructure.persistence.mapper.CompanyStaffMapper;
import com.graphhire.job.infrastructure.persistence.po.CompanyStaffPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CompanyStaffRepositoryImpl implements CompanyStaffRepository {

    @Autowired
    private CompanyStaffMapper companyStaffMapper;

    @Override
    public Optional<CompanyStaff> findByUserId(Long userId) {
        LambdaQueryWrapper<CompanyStaffPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CompanyStaffPO::getUserId, userId);
        CompanyStaffPO po = companyStaffMapper.selectOne(wrapper);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<CompanyStaff> findByCompanyId(Long companyId) {
        LambdaQueryWrapper<CompanyStaffPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CompanyStaffPO::getCompanyId, companyId);
        return companyStaffMapper.selectList(wrapper).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public CompanyStaff save(CompanyStaff companyStaff) {
        CompanyStaffPO po = toPO(companyStaff);
        if (companyStaff.getId() == null) {
            companyStaffMapper.insert(po);
            companyStaff.setId(po.getId());
        } else {
            companyStaffMapper.updateById(po);
        }
        return companyStaff;
    }

    @Override
    public void delete(CompanyStaff companyStaff) {
        if (companyStaff.getId() != null) {
            companyStaffMapper.deleteById(companyStaff.getId());
        }
    }

    private CompanyStaff toDomain(CompanyStaffPO po) {
        if (po == null) return null;
        CompanyStaff staff = new CompanyStaff();
        staff.setId(po.getId());
        staff.setCompanyId(po.getCompanyId());
        staff.setUserId(po.getUserId());
        staff.setPost(po.getPost());
        return staff;
    }

    private CompanyStaffPO toPO(CompanyStaff staff) {
        CompanyStaffPO po = new CompanyStaffPO();
        po.setId(staff.getId());
        po.setCompanyId(staff.getCompanyId());
        po.setUserId(staff.getUserId());
        po.setPost(staff.getPost());
        return po;
    }
}