package com.graphhire.job.application.service;

import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.auth.domain.vo.AuthStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CompanyAppService {

    @Autowired
    private CompanyRepository companyRepository;

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
}
