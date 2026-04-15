package com.graphhire.job.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.infrastructure.persistence.mapper.CompanyMapper;
import com.graphhire.job.infrastructure.persistence.po.CompanyPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CompanyRepositoryImpl implements CompanyRepository {

    @Autowired
    private CompanyMapper companyMapper;

    @Override
    public Optional<Company> findById(Long id) {
        CompanyPO po = companyMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public Optional<Company> findByUnifiedSocialCreditCode(String unifiedSocialCreditCode) {
        LambdaQueryWrapper<CompanyPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CompanyPO::getUnifiedSocialCreditCode, unifiedSocialCreditCode);
        CompanyPO po = companyMapper.selectOne(wrapper);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    @Override
    public List<Company> findByAuthStatus(AuthStatus authStatus) {
        LambdaQueryWrapper<CompanyPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CompanyPO::getAuthStatus, toDbStatus(authStatus));
        return companyMapper.selectList(wrapper).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Company save(Company company) {
        CompanyPO po = toPO(company);
        if (company.getId() == null) {
            companyMapper.insert(po);
            company.setId(po.getId());
        } else {
            companyMapper.updateById(po);
        }
        return company;
    }

    @Override
    public void delete(Company company) {
        if (company.getId() != null) {
            companyMapper.deleteById(company.getId());
        }
    }

    @Override
    public long countByAuthStatus(AuthStatus authStatus) {
        LambdaQueryWrapper<CompanyPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CompanyPO::getAuthStatus, toDbStatus(authStatus));
        return companyMapper.selectCount(wrapper);
    }

    private Company toDomain(CompanyPO po) {
        if (po == null) return null;
        Company company = new Company();
        company.setId(po.getId());
        company.setName(po.getCompanyName());
        company.setUnifiedSocialCreditCode(po.getUnifiedSocialCreditCode());
        company.setLicenseUrl(po.getLicensePath());
        company.setAuthStatus(toDomainStatus(po.getAuthStatus()));
        return company;
    }

    private CompanyPO toPO(Company company) {
        CompanyPO po = new CompanyPO();
        po.setId(company.getId());
        po.setCompanyName(company.getName());
        po.setUnifiedSocialCreditCode(company.getUnifiedSocialCreditCode());
        po.setLicensePath(company.getLicenseUrl());
        po.setAuthStatus(toDbStatus(company.getAuthStatus()));
        return po;
    }

    private Integer toDbStatus(AuthStatus status) {
        if (status == null) return 0;
        return switch (status) {
            case PENDING_VERIFY -> 0;
            case VERIFIED -> 1;
            case LOCKED, DISABLED -> 2;  // Map rejected to DISABLED since REJECTED doesn't exist in enum
            default -> 0;
        };
    }

    private AuthStatus toDomainStatus(Integer dbStatus) {
        if (dbStatus == null) return AuthStatus.PENDING_VERIFY;
        return switch (dbStatus) {
            case 0 -> AuthStatus.PENDING_VERIFY;
            case 1 -> AuthStatus.VERIFIED;
            case 2 -> AuthStatus.DISABLED;  // Map rejected to DISABLED since REJECTED doesn't exist in enum
            default -> AuthStatus.PENDING_VERIFY;
        };
    }
}