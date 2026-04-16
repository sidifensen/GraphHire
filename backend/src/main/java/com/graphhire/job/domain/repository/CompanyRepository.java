package com.graphhire.job.domain.repository;

import com.graphhire.job.domain.model.Company;
import com.graphhire.auth.domain.vo.AuthStatus;

import java.util.List;
import java.util.Optional;

/**
 * 企业仓储接口
 *
 * 【模块说明】定义企业数据的持久化操作规范，支持按ID、统一社会信用代码、认证状态查询。
 */
public interface CompanyRepository {
    /** 根据ID查询企业 */
    Optional<Company> findById(Long id);

    /** 根据统一社会信用代码查询企业（用于企业唯一性校验） */
    Optional<Company> findByUnifiedSocialCreditCode(String unifiedSocialCreditCode);

    /** 根据认证状态查询企业列表 */
    List<Company> findByAuthStatus(AuthStatus authStatus);

    /** 保存企业（新增或更新） */
    Company save(Company company);

    /** 删除企业 */
    void delete(Company company);

    /** 根据认证状态统计企业数量 */
    long countByAuthStatus(AuthStatus authStatus);
}
