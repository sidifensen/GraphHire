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

/**
 * 企业仓储实现
 *
 * 【模块说明】实现CompanyRepository接口，负责企业数据的数据库持久化操作。
 * 【数据来源】company表（通过CompanyMapper操作）
 *
 * 【方法概览】
 * - findById：根据ID查询企业
 * - findByUnifiedSocialCreditCode：根据统一社会信用代码查询
 * - findByAuthStatus：根据认证状态查询企业列表
 * - save：保存企业（新增或更新）
 * - delete：删除企业
 * - countByAuthStatus：统计各状态企业数量
 */
@Repository
public class CompanyRepositoryImpl implements CompanyRepository {

    @Autowired
    private CompanyMapper companyMapper;

    /**
     * 根据ID查询公司
     */
    @Override
    public Optional<Company> findById(Long id) {
        // 查询企业并转换为领域模型
        CompanyPO po = companyMapper.selectById(id);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    /**
     * 根据统一社会信用代码查询公司
     */
    @Override
    public Optional<Company> findByUnifiedSocialCreditCode(String unifiedSocialCreditCode) {
        // 按统一社会信用代码精确查询
        LambdaQueryWrapper<CompanyPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CompanyPO::getUnifiedSocialCreditCode, unifiedSocialCreditCode);
        CompanyPO po = companyMapper.selectOne(wrapper);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    /**
     * 根据认证状态查询公司列表
     */
    @Override
    public List<Company> findByAuthStatus(AuthStatus authStatus) {
        // 按认证状态查询企业列表
        LambdaQueryWrapper<CompanyPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CompanyPO::getAuthStatus, toDbStatus(authStatus));
        return companyMapper.selectList(wrapper).stream()
                .map(this::toDomain)
                .toList();
    }

    /**
     * 保存公司
     */
    @Override
    public Company save(Company company) {
        // 转换为PO后执行新增或更新
        CompanyPO po = toPO(company);
        if (company.getId() == null) {
            // 新增：插入后回填ID
            companyMapper.insert(po);
            company.setId(po.getId());
        } else {
            // 更新：根据ID更新
            companyMapper.updateById(po);
        }
        return company;
    }

    /**
     * 删除公司
     */
    @Override
    public void delete(Company company) {
        // 根据ID删除（逻辑删除由MyBatis-Plus配置处理）
        if (company.getId() != null) {
            companyMapper.deleteById(company.getId());
        }
    }

    /**
     * 统计各认证状态的公司数量
     */
    @Override
    public long countByAuthStatus(AuthStatus authStatus) {
        // 统计指定认证状态的企业数量
        LambdaQueryWrapper<CompanyPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CompanyPO::getAuthStatus, toDbStatus(authStatus));
        return companyMapper.selectCount(wrapper);
    }

    /** PO转Domain领域模型 */
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

    /** Domain转PO持久化对象 */
    private CompanyPO toPO(Company company) {
        CompanyPO po = new CompanyPO();
        po.setId(company.getId());
        po.setCompanyName(company.getName());
        po.setUnifiedSocialCreditCode(company.getUnifiedSocialCreditCode());
        po.setLicensePath(company.getLicenseUrl());
        po.setAuthStatus(toDbStatus(company.getAuthStatus()));
        return po;
    }

    /** 领域模型认证状态转数据库整数值 */
    private Integer toDbStatus(AuthStatus status) {
        if (status == null) return 0;
        return switch (status) {
            case PENDING_VERIFY -> 0;
            case VERIFIED -> 1;
            case LOCKED, DISABLED -> 2;  // 被拒绝映射为DISABLED，因为枚举中没有REJECTED
            default -> 0;
        };
    }

    /** 数据库整数值转领域模型认证状态 */
    private AuthStatus toDomainStatus(Integer dbStatus) {
        if (dbStatus == null) return AuthStatus.PENDING_VERIFY;
        return switch (dbStatus) {
            case 0 -> AuthStatus.PENDING_VERIFY;
            case 1 -> AuthStatus.VERIFIED;
            case 2 -> AuthStatus.DISABLED;  // 被拒绝映射为DISABLED，因为枚举中没有REJECTED
            default -> AuthStatus.PENDING_VERIFY;
        };
    }
}
