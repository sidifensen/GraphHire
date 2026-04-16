package com.graphhire.job.infrastructure.persistence.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import cn.hutool.core.bean.BeanUtil;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import com.graphhire.job.infrastructure.persistence.mapper.CompanyStaffMapper;
import com.graphhire.job.infrastructure.persistence.po.CompanyStaffPO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 企业员工仓储实现
 *
 * 【模块说明】实现CompanyStaffRepository接口，负责企业员工关联数据的数据库持久化操作。
 * 【数据来源】company_staff表（通过CompanyStaffMapper操作）
 *
 * 【方法概览】
 * - findByUserId：根据用户ID查询员工记录
 * - findByCompanyId：根据企业ID查询员工列表
 * - save：保存员工记录（新增或更新）
 * - delete：删除员工记录
 */
@Repository
public class CompanyStaffRepositoryImpl implements CompanyStaffRepository {

    @Autowired
    private CompanyStaffMapper companyStaffMapper;

    /** 根据用户ID查询公司员工关系 */
    @Override
    public Optional<CompanyStaff> findByUserId(Long userId) {
        // 根据用户ID精确查询
        LambdaQueryWrapper<CompanyStaffPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CompanyStaffPO::getUserId, userId);
        CompanyStaffPO po = companyStaffMapper.selectOne(wrapper);
        return Optional.ofNullable(po).map(this::toDomain);
    }

    /** 根据公司ID查询员工列表 */
    @Override
    public List<CompanyStaff> findByCompanyId(Long companyId) {
        // 根据企业ID查询所有关联员工
        LambdaQueryWrapper<CompanyStaffPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CompanyStaffPO::getCompanyId, companyId);
        return companyStaffMapper.selectList(wrapper).stream()
                .map(this::toDomain)
                .toList();
    }

    /** 保存员工关系 */
    @Override
    public CompanyStaff save(CompanyStaff companyStaff) {
        // 转换为PO后执行新增或更新
        CompanyStaffPO po = toPO(companyStaff);
        if (companyStaff.getId() == null) {
            // 新增：插入后回填ID
            companyStaffMapper.insert(po);
            companyStaff.setId(po.getId());
        } else {
            // 更新：根据ID更新
            companyStaffMapper.updateById(po);
        }
        return companyStaff;
    }

    /** 删除员工关系 */
    @Override
    public void delete(CompanyStaff companyStaff) {
        // 根据ID删除
        if (companyStaff.getId() != null) {
            companyStaffMapper.deleteById(companyStaff.getId());
        }
    }

    /** PO转Domain领域模型 */
    private CompanyStaff toDomain(CompanyStaffPO po) {
        if (po == null) return null;
        CompanyStaff staff = new CompanyStaff();
        BeanUtil.copyProperties(po, staff);
        return staff;
    }

    /** Domain转PO持久化对象 */
    private CompanyStaffPO toPO(CompanyStaff staff) {
        CompanyStaffPO po = new CompanyStaffPO();
        BeanUtil.copyProperties(staff, po);
        return po;
    }
}
