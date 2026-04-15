package com.graphhire.job.application.service;

import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.CompanyStaff;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.CompanyStaffRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.common.vo.Exceptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CompanyAppService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private CompanyStaffRepository companyStaffRepository;

    @Transactional
    public Company createCompany(String name, String unifiedSocialCreditCode,
                                 String licenseUrl, String contactName,
                                 String contactPhone, String contactEmail) {
        Company company = new Company();
        company.setName(name);
        company.setUnifiedSocialCreditCode(unifiedSocialCreditCode);
        company.setLicenseUrl(licenseUrl);
        company.setContactName(contactName);
        company.setContactPhone(contactPhone);
        company.setContactEmail(contactEmail);
        company.setAuthStatus(AuthStatus.PENDING_VERIFY);
        return companyRepository.save(company);
    }

    @Transactional
    public Company approveCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("企业不存在"));
        company.approve();
        return companyRepository.save(company);
    }

    @Transactional
    public Company rejectCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("企业不存在"));
        company.reject();
        return companyRepository.save(company);
    }

    @Transactional
    public Company updateCompanyInfo(Long companyId, String name, String contactName,
                                     String contactPhone, String contactEmail,
                                     String description, String website) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("企业不存在"));
        company.updateInfo(name, contactName, contactPhone, contactEmail, description, website);
        return companyRepository.save(company);
    }

    public Company getCompanyById(Long companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("企业不存在"));
    }

    public List<Company> getCompaniesByAuthStatus(AuthStatus authStatus) {
        return companyRepository.findByAuthStatus(authStatus);
    }

    public List<Company> getPendingCompanies() {
        return companyRepository.findByAuthStatus(AuthStatus.PENDING_VERIFY);
    }

    public Long getCompanyIdByUserId(Long userId) {
        CompanyStaff staff = companyStaffRepository.findByUserId(userId)
                .orElseThrow(() -> Exceptions.BusinessException.of("用户未绑定企业"));
        return staff.getCompanyId();
    }

    public Company getCompanyByUserId(Long userId) {
        Long companyId = getCompanyIdByUserId(userId);
        return companyRepository.findById(companyId)
                .orElseThrow(() -> Exceptions.BusinessException.of("企业不存在"));
    }
}
