package com.graphhire.publicapi.interfaces.controller;

import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.common.vo.Result;
import com.graphhire.industry.application.service.IndustryAppService;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.interfaces.dto.response.CompanyAvatarUrlResolver;
import com.graphhire.publicapi.interfaces.dto.response.PublicCompanyCardResponse;
import com.graphhire.publicapi.interfaces.dto.response.PublicHomeResponse;
import com.graphhire.publicapi.interfaces.dto.response.PublicJobCardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/public/home")
public class PublicHomeController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private CompanyAppService companyAppService;

    @Autowired
    private CompanyAvatarUrlResolver companyAvatarUrlResolver;

    @Autowired
    private IndustryAppService industryAppService;

    @GetMapping
    public Result<PublicHomeResponse> getHomeOverview() {
        List<Job> publishedJobs = jobRepository.findByStatus(JobStatus.PUBLISHED);
        Map<Long, String> industryNameMap = industryAppService.listIndustries(1).stream()
                .filter(industry -> industry.getId() != null)
                .collect(Collectors.toMap(Industry::getId, Industry::getName, (left, right) -> left));
        List<PublicJobCardResponse> featuredJobs = publishedJobs.stream()
                .sorted(Comparator.comparing(Job::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(6)
                .map(job -> toJobCard(job, industryNameMap))
                .toList();

        List<PublicCompanyCardResponse> popularCompanies = companyAppService.getCompaniesByAuthStatus(AuthStatus.VERIFIED).stream()
                .map(this::toCompanyCard)
                .sorted(Comparator.comparing(PublicCompanyCardResponse::jobCount, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(6)
                .toList();

        List<String> hotCities = publishedJobs.stream()
                .map(Job::getLocation)
                .filter(location -> location != null && location.getCity() != null && !location.getCity().isBlank())
                .map(location -> location.getCity())
                .distinct()
                .limit(8)
                .toList();

        return Result.success(new PublicHomeResponse(featuredJobs, popularCompanies, hotCities));
    }

    private PublicJobCardResponse toJobCard(Job job, Map<Long, String> industryNameMap) {
        Company company = companyRepository.findById(job.getCompanyId()).orElse(null);
        return new PublicJobCardResponse(
                job.getId(),
                job.getCompanyId(),
                company != null ? company.getName() : "未知企业",
                company != null ? industryNameMap.get(company.getIndustryId()) : null,
                company != null ? company.getScale() : null,
                company != null && company.getAuthStatus() != null ? company.getAuthStatus().name() : null,
                company != null ? companyAvatarUrlResolver.resolve(company.getAvatarPath()) : null,
                job.getTitle(),
                job.getLocation() != null ? job.getLocation().getCity() : null,
                job.getLocation() != null ? job.getLocation().getDistrict() : null,
                job.getSalaryRange() != null ? job.getSalaryRange().getMin() : null,
                job.getSalaryRange() != null ? job.getSalaryRange().getMax() : null,
                job.getSalaryRange() != null ? job.getSalaryRange().getUnit() : null,
                job.getRequiredSkills() != null ? job.getRequiredSkills() : List.of(),
                job.getDescription(),
                job.getExperience(),
                job.getEducation(),
                job.getPositionTypeId(),
                job.getJobType(),
                job.getPublishedAt()
        );
    }

    private PublicCompanyCardResponse toCompanyCard(Company company) {
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
        Map<Long, String> industryNameMap = industryAppService.listIndustries(1).stream()
                .filter(industry -> industry.getId() != null)
                .collect(Collectors.toMap(Industry::getId, Industry::getName, (left, right) -> left));
        return new PublicCompanyCardResponse(
                company.getId(),
                company.getName(),
                city,
                jobCount,
                summary,
                company.getDescription(),
                company.getAddress(),
                company.getAuthStatus().name(),
                companyAvatarUrlResolver.resolve(company.getAvatarPath()),
                company.getIndustryId(),
                company.getIndustryId() == null ? null : industryNameMap.get(company.getIndustryId()),
                company.getScale()
        );
    }
}
