package com.graphhire.publicapi.interfaces.controller;

import cn.hutool.core.collection.CollUtil;
import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;
import com.graphhire.publicapi.interfaces.dto.response.PublicJobCardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/public/jobs")
public class PublicJobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    public Result<PageResult<PublicJobCardResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer salaryMin,
            @RequestParam(required = false) Integer salaryMax,
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false, defaultValue = "createTime") String sortBy,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        List<Job> allPublishedJobs = jobRepository.findByStatus(JobStatus.PUBLISHED);

        List<Job> filteredJobs = allPublishedJobs.stream()
                .filter(job -> matchesKeyword(job, keyword))
                .filter(job -> matchesCity(job, city))
                .filter(job -> matchesSalaryRange(job, salaryMin, salaryMax))
                .filter(job -> matchesSkills(job, skills))
                .collect(Collectors.toList());

        List<Job> sortedJobs = applySort(filteredJobs, sortBy);

        int total = sortedJobs.size();
        int fromIndex = Math.max((page - 1) * size, 0);
        int toIndex = Math.min(fromIndex + size, total);

        List<PublicJobCardResponse> pagedJobs = fromIndex < total
                ? sortedJobs.subList(fromIndex, toIndex).stream().map(this::toCard).toList()
                : List.of();

        return Result.success(new PageResult<>(pagedJobs, (long) total, page, size));
    }

    @GetMapping("/{id}")
    public Result<PublicJobCardResponse> getJob(@PathVariable Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("职位不存在"));
        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new IllegalArgumentException("职位不存在或已下架");
        }
        return Result.success(toCard(job));
    }

    private PublicJobCardResponse toCard(Job job) {
        Company company = companyRepository.findById(job.getCompanyId()).orElse(null);
        Location location = job.getLocation();
        SalaryRange salaryRange = job.getSalaryRange();
        return new PublicJobCardResponse(
                job.getId(),
                job.getCompanyId(),
                company != null ? company.getName() : "未知企业",
                job.getTitle(),
                location != null ? location.getCity() : null,
                location != null ? location.getDistrict() : null,
                salaryRange != null ? salaryRange.getMin() : null,
                salaryRange != null ? salaryRange.getMax() : null,
                salaryRange != null ? salaryRange.getUnit() : null,
                job.getRequiredSkills() != null ? job.getRequiredSkills() : List.of()
        );
    }

    private boolean matchesKeyword(Job job, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String lowerKeyword = keyword.toLowerCase();
        return (job.getTitle() != null && job.getTitle().toLowerCase().contains(lowerKeyword))
                || (job.getDescription() != null && job.getDescription().toLowerCase().contains(lowerKeyword));
    }

    private boolean matchesCity(Job job, String city) {
        if (city == null || city.isBlank()) {
            return true;
        }
        Location location = job.getLocation();
        return location != null && city.equals(location.getCity());
    }

    private boolean matchesSalaryRange(Job job, Integer salaryMin, Integer salaryMax) {
        if (salaryMin == null && salaryMax == null) {
            return true;
        }
        SalaryRange salaryRange = job.getSalaryRange();
        if (salaryRange == null || salaryRange.isEmpty()) {
            return false;
        }
        boolean minMatch = salaryMin == null || (salaryRange.getMax() != null && salaryRange.getMax() >= salaryMin);
        boolean maxMatch = salaryMax == null || (salaryRange.getMin() != null && salaryRange.getMin() <= salaryMax);
        return minMatch && maxMatch;
    }

    private boolean matchesSkills(Job job, List<String> skills) {
        if (CollUtil.isEmpty(skills)) {
            return true;
        }
        List<String> requiredSkills = job.getRequiredSkills();
        if (CollUtil.isEmpty(requiredSkills)) {
            return true;
        }
        return skills.stream().anyMatch(skill -> requiredSkills.stream().anyMatch(required -> required.equalsIgnoreCase(skill)));
    }

    private List<Job> applySort(List<Job> jobs, String sortBy) {
        if (jobs == null || jobs.isEmpty()) {
            return jobs;
        }
        if ("salary".equalsIgnoreCase(sortBy)) {
            return jobs.stream()
                    .sorted(Comparator.comparing((Job job) -> {
                        SalaryRange range = job.getSalaryRange();
                        return range != null ? range.getMax() : null;
                    }, Comparator.nullsLast(Comparator.reverseOrder())))
                    .toList();
        }
        return jobs.stream().sorted(Comparator.comparing(Job::getId, Comparator.nullsLast(Comparator.reverseOrder()))).toList();
    }
}
