package com.graphhire.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.graphhire.domain.model.Company;
import com.graphhire.domain.repository.CompanyRepository;
import com.graphhire.domain.vo.AuthStatus;
import com.graphhire.infrastructure.persistence.mapper.CompanyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CompanyRepositoryImpl implements CompanyRepository {
    private final CompanyMapper companyMapper;

    @Override
    public Company findById(Long id) {
        return companyMapper.selectById(id);
    }

    @Override
    public Optional<Company> findByIdOptional(Long id) {
        return Optional.ofNullable(findById(id));
    }

    @Override
    public Company findByUserId(Long userId) {
        return companyMapper.selectOne(new LambdaQueryWrapper<Company>().eq(Company::getUserId, userId));
    }

    @Override
    public Optional<Company> findByUserIdOptional(Long userId) {
        return Optional.ofNullable(findByUserId(userId));
    }

    @Override
    public Company save(Company company) {
        if (company.getId() == null) {
            companyMapper.insert(company);
        } else {
            companyMapper.updateById(company);
        }
        return company;
    }

    @Override
    public List<Company> findByAuthStatus(AuthStatus status) {
        return companyMapper.selectList(new LambdaQueryWrapper<Company>().eq(Company::getAuthStatus, status));
    }

    @Override
    public List<Company> findByAuthStatus(AuthStatus status, Integer page, Integer pageSize) {
        int offset = (page - 1) * pageSize;
        return companyMapper.selectList(new LambdaQueryWrapper<Company>()
                .eq(Company::getAuthStatus, status)
                .orderByDesc(Company::getCreatedAt)
                .last("LIMIT " + offset + ", " + pageSize));
    }

    @Override
    public Long countByAuthStatus(AuthStatus status) {
        return companyMapper.selectCount(new LambdaQueryWrapper<Company>().eq(Company::getAuthStatus, status));
    }
}
