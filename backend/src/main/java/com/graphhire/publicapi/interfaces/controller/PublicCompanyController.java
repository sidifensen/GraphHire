package com.graphhire.publicapi.interfaces.controller;

import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.publicapi.interfaces.dto.response.PublicCompanyCardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/public/companies")
public class PublicCompanyController {

    @Autowired
    private CompanyAppService companyAppService;

    @Autowired
    private JobRepository jobRepository;

    @GetMapping
    public Result<PageResult<PublicCompanyCardResponse>> searchCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        List<Company> allApprovedCompanies = companyAppService.getCompaniesByAuthStatus(AuthStatus.VERIFIED);

        List<Company> filteredCompanies = allApprovedCompanies.stream()
                .filter(company -> matchesKeyword(company, keyword))
                .collect(Collectors.toList());

        List<PublicCompanyCardResponse> cards = filteredCompanies.stream()
                .map(this::toCard)
                .sorted(Comparator.comparing(PublicCompanyCardResponse::jobCount, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        int total = cards.size();
        int fromIndex = Math.max((page - 1) * size, 0);
        int toIndex = Math.min(fromIndex + size, total);
        List<PublicCompanyCardResponse> pagedCompanies = fromIndex < total ? cards.subList(fromIndex, toIndex) : List.of();

        return Result.success(new PageResult<>(pagedCompanies, (long) total, page, size));
    }

    @GetMapping("/{id}")
    public Result<PublicCompanyCardResponse> getCompany(@PathVariable Long id) {
        Company company = companyAppService.getCompanyById(id);
        if (company.getAuthStatus() != AuthStatus.VERIFIED) {
            throw new IllegalArgumentException("企业不存在或未认证");
        }
        return Result.success(toCard(company));
    }

    private PublicCompanyCardResponse toCard(Company company) {
        List<Job> publishedJobs = jobRepository.findByCompanyId(company.getId()).stream()
                .filter(job -> job.getStatus() == JobStatus.PUBLISHED)
                .toList();
        String city = publishedJobs.stream()
                .map(Job::getLocation)
                .filter(location -> location != null && location.getCity() != null && !location.getCity().isBlank())
                .map(location -> location.getCity())
                .findFirst()
                .orElse(null);
        int jobCount = publishedJobs.size();
        String summary = jobCount > 0
                ? "已认证企业，当前开放 " + jobCount + " 个职位"
                : "已认证企业，当前暂无开放职位";
        return new PublicCompanyCardResponse(
                company.getId(),
                company.getName(),
                city,
                jobCount,
                summary,
                company.getAuthStatus().name()
        );
    }

    private boolean matchesKeyword(Company company, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String lowerKeyword = keyword.toLowerCase();
        return company.getName() != null && company.getName().toLowerCase().contains(lowerKeyword);
    }
}
