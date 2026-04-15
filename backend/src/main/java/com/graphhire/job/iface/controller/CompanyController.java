package com.graphhire.job.iface.controller;

import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.common.vo.Result;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.domain.model.Company;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/company")
public class CompanyController {

    @Autowired
    private CompanyAppService companyAppService;

    @PostMapping("/create")
    public Result<Long> createCompany(@RequestParam String name,
                                       @RequestParam String unifiedSocialCreditCode,
                                       @RequestParam(required = false) String licenseUrl,
                                       @RequestParam(required = false) String contactName,
                                       @RequestParam(required = false) String contactPhone,
                                       @RequestParam(required = false) String contactEmail) {
        Company company = companyAppService.createCompany(name, unifiedSocialCreditCode,
                licenseUrl, contactName, contactPhone, contactEmail);
        return Result.success(company.getId());
    }

    @PostMapping("/{id}/approve")
    public Result<Void> approveCompany(@PathVariable Long id) {
        companyAppService.approveCompany(id);
        return Result.success();
    }

    @PostMapping("/{id}/reject")
    public Result<Void> rejectCompany(@PathVariable Long id) {
        companyAppService.rejectCompany(id);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> updateCompany(@PathVariable Long id,
                                      @RequestParam(required = false) String name,
                                      @RequestParam(required = false) String contactName,
                                      @RequestParam(required = false) String contactPhone,
                                      @RequestParam(required = false) String contactEmail,
                                      @RequestParam(required = false) String description,
                                      @RequestParam(required = false) String website) {
        companyAppService.updateCompanyInfo(id, name, contactName, contactPhone,
                contactEmail, description, website);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Company> getCompany(@PathVariable Long id) {
        return Result.success(companyAppService.getCompanyById(id));
    }

    @GetMapping("/pending")
    public Result<List<Company>> getPendingCompanies() {
        return Result.success(companyAppService.getPendingCompanies());
    }

    @GetMapping
    public Result<List<Company>> getCompaniesByAuthStatus(@RequestParam AuthStatus authStatus) {
        return Result.success(companyAppService.getCompaniesByAuthStatus(authStatus));
    }
}
