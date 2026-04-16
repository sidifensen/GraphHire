package com.graphhire.job.domain.repository;

import com.graphhire.job.domain.model.CompanyStaff;

import java.util.List;
import java.util.Optional;

/**
 * 企业员工仓储接口
 *
 * 【模块说明】定义企业员工（用户与企业关联关系）的持久化操作规范。
 */
public interface CompanyStaffRepository {
    /** 根据ID查询企业员工记录 */
    Optional<CompanyStaff> findById(Long id);

    /** 根据用户ID查询该用户关联的企业员工记录 */
    Optional<CompanyStaff> findByUserId(Long userId);

    /** 根据企业ID查询该企业下所有员工 */
    List<CompanyStaff> findByCompanyId(Long companyId);

    /** 保存企业员工（新增或更新） */
    CompanyStaff save(CompanyStaff companyStaff);

    /** 删除企业员工记录 */
    void delete(CompanyStaff companyStaff);
}
