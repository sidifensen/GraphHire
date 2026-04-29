package com.graphhire.job.application.service;

import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.common.vo.Exceptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CompanyAppService {

    private static final Logger log = LoggerFactory.getLogger(CompanyAppService.class);

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private CompanyStaffRepository companyStaffRepository;

    /**
     * 创建公司
     * 【功能说明】注册新公司，初始化认证状态为待认证。
     * 【业务步骤】
     * 步骤1：构建公司领域模型
     * 步骤2：设置初始认证状态为待审核
     * 步骤3：保存公司信息到数据库
     */
    @Transactional
    public Company createCompany(String name, String unifiedSocialCreditCode,
                                 String licenseUrl, String contactName,
                                 String contactPhone, String contactEmail) {
        companyRepository.findByName(name).ifPresent(existing -> {
            throw Exceptions.BusinessException.of("公司名称已存在");
        });

        // 步骤1：构建公司领域模型
        Company company = new Company();
        company.setName(name);
        company.setUnifiedSocialCreditCode(unifiedSocialCreditCode);
        company.setLicenseUrl(licenseUrl);
        company.setContactName(contactName);
        company.setContactPhone(contactPhone);
        company.setContactEmail(contactEmail);

        // 步骤2：设置初始认证状态为待审核
        company.setAuthStatus(AuthStatus.PENDING_VERIFY);

        // 步骤3：保存公司信息到数据库
        log.info("创建企业: name={}, unifiedSocialCreditCode={}", name, unifiedSocialCreditCode);
        return saveCompany(company, "创建企业完成");
    }

    /**
     * 审批公司
     * 【功能说明】管理员审批通过公司申请，将公司认证状态更新为已认证。
     * 【业务步骤】
     * 步骤1：根据公司ID查询公司信息
     * 步骤2：调用公司领域模型审批方法更新状态
     * 步骤3：保存更新后的公司信息
     */
    @Transactional
    public Company approveCompany(Long companyId) {
        // 步骤1：根据公司ID查询公司信息
        Company company = requireCompany(companyId);

        // 步骤2：调用公司领域模型审批方法更新状态
        company.approve();

        // 步骤3：保存更新后的公司信息
        return saveCompany(company, "企业审核通过");
    }

    /**
     * 拒绝公司
     * 【功能说明】管理员拒绝公司申请，将公司认证状态更新为已拒绝。
     * 【业务步骤】
     * 步骤1：根据公司ID查询公司信息
     * 步骤2：调用公司领域模型拒绝方法更新状态
     * 步骤3：保存更新后的公司信息
     */
    @Transactional
    public Company rejectCompany(Long companyId) {
        // 步骤1：根据公司ID查询公司信息
        Company company = requireCompany(companyId);

        // 步骤2：调用公司领域模型拒绝方法更新状态
        company.reject();

        // 步骤3：保存更新后的公司信息
        return saveCompany(company, "企业审核拒绝");
    }

    /**
     * 更新公司信息
     * 【功能说明】更新公司的基本信息，包括名称、联系方式、简介和网站等。
     * 【业务步骤】
     * 步骤1：根据公司ID查询公司信息
     * 步骤2：调用公司领域模型更新方法修改信息
     * 步骤3：保存更新后的公司信息
     */
    @Transactional
    public Company updateCompanyInfo(Long companyId, String name, String contactName,
                                     String contactPhone, String contactEmail,
                                     String description, String website) {
        // 步骤1：根据公司ID查询公司信息
        Company company = requireCompany(companyId);

        // 步骤2：调用公司领域模型更新方法修改信息
        company.updateInfo(name, contactName, contactPhone, contactEmail, description, website);

        // 步骤3：保存更新后的公司信息
        log.info("更新企业信息: companyId={}, name={}", companyId, name);
        return saveCompany(company, "更新企业信息完成");
    }

    /**
     * 根据ID获取公司
     * 【功能说明】根据公司唯一标识ID查询并返回公司完整信息。
     * 【业务步骤】
     * 步骤1：根据公司ID查询公司信息
     * 步骤2：若公司不存在则抛出异常
     * 步骤3：返回公司信息
     */
    public Company getCompanyById(Long companyId) {
        // 步骤1：根据公司ID查询公司信息
        return requireCompany(companyId);
        // 步骤3：返回公司信息
    }

    /**
     * 根据认证状态获取公司列表
     * 【功能说明】根据指定的认证状态查询所有符合条件的企业。
     * 【业务步骤】
     * 步骤1：调用仓储层按认证状态查询方法
     * 步骤2：返回符合条件的公司列表
     */
    public List<Company> getCompaniesByAuthStatus(AuthStatus authStatus) {
        // 步骤1：调用仓储层按认证状态查询方法
        return companyRepository.findByAuthStatus(authStatus);
        // 步骤2：返回符合条件的公司列表
    }

    /**
     * 获取待审批公司列表
     * 【功能说明】查询所有认证状态为待审核的企业列表。
     * 【业务步骤】
     * 步骤1：调用仓储层按待审核状态查询方法
     * 步骤2：返回待审批公司列表
     */
    public List<Company> getPendingCompanies() {
        // 步骤1：调用仓储层按待审核状态查询方法
        return companyRepository.findByAuthStatus(AuthStatus.PENDING_VERIFY);
        // 步骤2：返回待审批公司列表
    }

    /**
     * 根据用户ID获取公司ID
     * 【功能说明】通过用户ID查询其所属公司的唯一标识ID。
     * 【业务步骤】
     * 步骤1：根据用户ID查询公司员工关联信息
     * 步骤2：若用户未绑定企业则抛出异常
     * 步骤3：返回公司ID
     */
    public Long getCompanyIdByUserId(Long userId) {
        // 步骤1：根据用户ID查询公司员工关联信息
        CompanyStaff staff = companyStaffRepository.findByUserId(userId)
                // 步骤2：若用户未绑定企业则抛出异常
                .orElseThrow(() -> Exceptions.BusinessException.of("用户未绑定企业"));

        // 步骤3：返回公司ID
        return staff.getCompanyId();
    }

    /**
     * 根据用户ID获取公司完整信息
     * 【功能说明】通过用户ID查询其所属公司的完整信息。
     * 【业务步骤】
     * 步骤1：根据用户ID获取公司ID
     * 步骤2：根据公司ID查询公司完整信息
     * 步骤3：若公司不存在则抛出异常
     * 步骤4：返回公司信息
     */
    public Company getCompanyByUserId(Long userId) {
        // 步骤1：根据用户ID获取公司ID
        Long companyId = getCompanyIdByUserId(userId);

        // 步骤2：根据公司ID查询公司完整信息
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> Exceptions.BusinessException.of("企业不存在"));
        log.info("根据用户查询企业: userId={}, companyId={}", userId, companyId);
        return company;
        // 步骤4：返回公司信息
    }

    /**
     * 提交认证材料
     * 【功能说明】用户提交公司营业执照等认证材料，将认证状态更新为待审核。
     * 【业务步骤】
     * 步骤1：根据用户ID获取所属公司信息
     * 步骤2：更新公司营业执照URL
     * 步骤3：重置认证状态为待审核
     * 步骤4：保存更新后的公司信息
     */
    @Transactional
    public Company submitAuthMaterials(Long userId, String licenseUrl) {
        // 步骤1：根据用户ID获取所属公司信息
        Company company = getCompanyByUserId(userId);

        // 步骤2：更新公司营业执照URL
        company.setLicenseUrl(licenseUrl);

        // 步骤3：重置认证状态为待审核
        company.setAuthStatus(AuthStatus.PENDING_VERIFY);

        // 步骤4：保存更新后的公司信息
        log.info("提交企业认证材料: userId={}, companyId={}", userId, company.getId());
        return saveCompany(company, "提交企业认证材料完成");
    }

    @Transactional
    public Company updateCompanyAvatarPath(Long companyId, String avatarPath) {
        Company company = requireCompany(companyId);
        company.setAvatarPath(avatarPath);
        log.info("更新企业头像路径: companyId={}, avatarPath={}", companyId, avatarPath);
        return saveCompany(company, "更新企业头像完成");
    }

    private Company requireCompany(Long companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("企业不存在"));
    }

    private Company saveCompany(Company company, String action) {
        Company savedCompany = companyRepository.save(company);
        log.info("{}: companyId={}, authStatus={}", action, savedCompany.getId(), savedCompany.getAuthStatus());
        return savedCompany;
    }
}
