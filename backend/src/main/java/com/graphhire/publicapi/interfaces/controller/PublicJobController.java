package com.graphhire.publicapi.interfaces.controller;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.industry.application.service.IndustryAppService;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.CompanyRepository;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;
import com.graphhire.job.interfaces.dto.response.CompanyAvatarUrlResolver;
import com.graphhire.positiontype.application.service.PositionTypeAppService;
import com.graphhire.positiontype.domain.model.PositionType;
import com.graphhire.publicapi.application.service.HotSearchAppService;
import com.graphhire.publicapi.interfaces.dto.response.PublicHotSearchItemResponse;
import com.graphhire.publicapi.interfaces.dto.response.PublicJobCardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.HashSet;
import java.util.Map;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.function.Function;

@RestController
@RequestMapping("/public/jobs")
public class PublicJobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PositionTypeAppService positionTypeAppService;

    @Autowired
    private IndustryAppService industryAppService;

    @Autowired
    private CompanyAvatarUrlResolver companyAvatarUrlResolver;

    @Autowired
    private HotSearchAppService hotSearchAppService;

    @GetMapping
    public Result<PageResult<PublicJobCardResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) List<String> cityList,
            @RequestParam(required = false) Integer salaryMin,
            @RequestParam(required = false) Integer salaryMax,
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false) List<Long> positionTypeLeafIds,
            @RequestParam(required = false) List<Long> industryLeafIds,
            @RequestParam(required = false) Integer jobType,
            @RequestParam(required = false) Integer educationCode,
            @RequestParam(required = false) String companyScaleCode,
            @RequestParam(required = false, defaultValue = "createTime") String sortBy,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        hotSearchAppService.recordJobKeyword(keyword);

        List<Job> allPublishedJobs = jobRepository.findByStatus(JobStatus.PUBLISHED);
        List<String> normalizedCityList = normalizeCityList(cityList, city);
        List<Long> normalizedPositionTypeLeafIds = normalizePositionTypeLeafIds(positionTypeLeafIds);
        List<Long> normalizedIndustryLeafIds = normalizeIndustryLeafIds(industryLeafIds);
        String normalizedCompanyScaleCode = StrUtil.trim(companyScaleCode);

        boolean hasAdvancedFilter = CollUtil.isNotEmpty(skills)
                || companyId != null
                || CollUtil.isNotEmpty(normalizedPositionTypeLeafIds)
                || CollUtil.isNotEmpty(normalizedIndustryLeafIds)
                || CollUtil.isNotEmpty(normalizedCityList)
                || jobType != null
                || educationCode != null
                || StrUtil.isNotBlank(normalizedCompanyScaleCode);

        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        int offset = (safePage - 1) * safeSize;
        Map<Long, String> industryNameMap = loadIndustryNameMap();

        if (!hasAdvancedFilter) {
            List<Job> pagedJobs = jobRepository.searchPublishedJobs(keyword, city, salaryMin, salaryMax, sortBy, offset, safeSize);
            long total = jobRepository.countPublishedJobs(keyword, city, salaryMin, salaryMax);
            Map<Long, Company> companyMap = companyRepository.findByIds(
                    pagedJobs.stream().map(Job::getCompanyId).distinct().toList()
            ).stream().collect(Collectors.toMap(Company::getId, Function.identity()));
            List<PublicJobCardResponse> records = pagedJobs.stream().map(job -> toCard(job, companyMap, industryNameMap)).toList();
            return Result.success(new PageResult<>(records, total, safePage, safeSize));
        }

        Map<Long, Company> companyMap = companyRepository.findByIds(
                allPublishedJobs.stream().map(Job::getCompanyId).filter(Objects::nonNull).distinct().toList()
        ).stream().collect(Collectors.toMap(Company::getId, Function.identity()));

        List<Job> filteredJobs = allPublishedJobs.stream()
                .filter(job -> matchesKeyword(job, keyword))
                .filter(job -> matchesCompany(job, companyId))
                .filter(job -> matchesCityList(job, normalizedCityList))
                .filter(job -> matchesSalaryRange(job, salaryMin, salaryMax))
                .filter(job -> matchesSkills(job, skills))
                .filter(job -> matchesPositionType(job, normalizedPositionTypeLeafIds))
                .filter(job -> matchesIndustry(job, normalizedIndustryLeafIds, companyMap))
                .filter(job -> matchesCompanyScale(job, normalizedCompanyScaleCode, companyMap))
                .filter(job -> matchesJobType(job, jobType))
                .filter(job -> matchesEducation(job, educationCode))
                .collect(Collectors.toList());

        List<Job> sortedJobs = applySort(filteredJobs, sortBy);

        int total = sortedJobs.size();
        int fromIndex = Math.max((safePage - 1) * safeSize, 0);
        int toIndex = Math.min(fromIndex + safeSize, total);

        Map<Long, Company> pagedCompanyMap = companyRepository.findByIds(
                sortedJobs.stream().skip(fromIndex).limit(Math.max(toIndex - fromIndex, 0)).map(Job::getCompanyId).distinct().toList()
        ).stream().collect(Collectors.toMap(Company::getId, Function.identity()));
        List<PublicJobCardResponse> pagedJobs = fromIndex < total
                ? sortedJobs.subList(fromIndex, toIndex).stream().map(job -> toCard(job, pagedCompanyMap, industryNameMap)).toList()
                : List.of();

        return Result.success(new PageResult<>(pagedJobs, (long) total, safePage, safeSize));
    }

    @GetMapping("/hot-searches")
    public Result<List<PublicHotSearchItemResponse>> listHotSearches(
            @RequestParam(required = false) Integer limit) {
        return Result.success(hotSearchAppService.listJobHotSearches(limit));
    }

    @GetMapping("/{id}")
    public Result<PublicJobCardResponse> getJob(@PathVariable Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("职位不存在"));
        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new IllegalArgumentException("职位不存在或已下架");
        }
        Map<Long, Company> companyMap = companyRepository.findByIds(List.of(job.getCompanyId())).stream()
                .collect(Collectors.toMap(Company::getId, Function.identity()));
        return Result.success(toCard(job, companyMap, loadIndustryNameMap()));
    }

    private PublicJobCardResponse toCard(Job job, Map<Long, Company> companyMap, Map<Long, String> industryNameMap) {
        Company company = companyMap.get(job.getCompanyId());
        Location location = job.getLocation();
        SalaryRange salaryRange = job.getSalaryRange();
        return new PublicJobCardResponse(
                job.getId(),
                job.getCompanyId(),
                company != null ? company.getName() : "未知企业",
                company != null ? industryNameMap.get(company.getIndustryId()) : null,
                company != null ? StrUtil.trim(company.getScale()) : null,
                company != null && company.getAuthStatus() != null ? company.getAuthStatus().name() : null,
                company != null ? companyAvatarUrlResolver.resolve(company.getAvatarPath()) : null,
                job.getTitle(),
                location != null ? location.getCity() : null,
                location != null ? location.getDistrict() : null,
                salaryRange != null ? salaryRange.getMin() : null,
                salaryRange != null ? salaryRange.getMax() : null,
                salaryRange != null ? salaryRange.getUnit() : null,
                job.getRequiredSkills() != null ? job.getRequiredSkills() : List.of(),
                job.getDescription(),
                job.getExperience(),
                job.getEducation(),
                job.getPositionTypeId(),
                job.getJobType(),
                job.getPublishedAt()
        );
    }

    private Map<Long, String> loadIndustryNameMap() {
        return industryAppService.listIndustries(1).stream()
                .filter(industry -> industry.getId() != null)
                .collect(Collectors.toMap(Industry::getId, Industry::getName, (left, right) -> left));
    }

    private boolean matchesKeyword(Job job, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String lowerKeyword = keyword.toLowerCase();
        return (job.getTitle() != null && job.getTitle().toLowerCase().contains(lowerKeyword))
                || (job.getDescription() != null && job.getDescription().toLowerCase().contains(lowerKeyword));
    }

    private boolean matchesCityList(Job job, List<String> cityList) {
        if (CollUtil.isEmpty(cityList)) {
            return true;
        }
        Location location = job.getLocation();
        if (location == null || StrUtil.isBlank(location.getCity())) {
            return false;
        }
        return cityList.contains(location.getCity());
    }

    private boolean matchesCompany(Job job, Long companyId) {
        if (companyId == null) {
            return true;
        }
        return companyId.equals(job.getCompanyId());
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

    private boolean matchesPositionType(Job job, List<Long> positionTypeLeafIds) {
        if (CollUtil.isEmpty(positionTypeLeafIds)) {
            return true;
        }
        return job.getPositionTypeId() != null && positionTypeLeafIds.contains(job.getPositionTypeId());
    }

    private boolean matchesIndustry(Job job, List<Long> industryLeafIds, Map<Long, Company> companyMap) {
        if (CollUtil.isEmpty(industryLeafIds)) {
            return true;
        }
        Company company = companyMap.get(job.getCompanyId());
        return company != null && company.getIndustryId() != null && industryLeafIds.contains(company.getIndustryId());
    }

    private boolean matchesCompanyScale(Job job, String companyScaleCode, Map<Long, Company> companyMap) {
        if (StrUtil.isBlank(companyScaleCode)) {
            return true;
        }
        Company company = companyMap.get(job.getCompanyId());
        return company != null && StrUtil.equals(companyScaleCode, StrUtil.trim(company.getScale()));
    }

    private boolean matchesJobType(Job job, Integer jobType) {
        if (jobType == null) {
            return true;
        }
        return Objects.equals(job.getJobType(), jobType);
    }

    private boolean matchesEducation(Job job, Integer educationCode) {
        if (educationCode == null) {
            return true;
        }
        return Objects.equals(job.getEducation(), educationCode);
    }

    private List<String> normalizeCityList(List<String> cityList, String city) {
        List<String> source = CollUtil.isNotEmpty(cityList) ? cityList : (StrUtil.isNotBlank(city) ? List.of(city) : List.of());
        if (CollUtil.isEmpty(source)) {
            return List.of();
        }
        return source.stream()
                .filter(StrUtil::isNotBlank)
                .map(StrUtil::trim)
                .distinct()
                .toList();
    }

    private List<Long> normalizePositionTypeLeafIds(List<Long> requestedIds) {
        if (CollUtil.isEmpty(requestedIds)) {
            return List.of();
        }
        List<PositionType> enabled = positionTypeAppService.listAll().stream()
                .filter(item -> item.getStatus() != null && item.getStatus() == 1)
                .toList();
        Set<Long> parentIds = enabled.stream()
                .map(PositionType::getParentId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<Long> enabledLeafIds = enabled.stream()
                .map(PositionType::getId)
                .filter(Objects::nonNull)
                .filter(id -> !parentIds.contains(id))
                .collect(Collectors.toSet());
        return requestedIds.stream()
                .filter(Objects::nonNull)
                .filter(enabledLeafIds::contains)
                .distinct()
                .toList();
    }

    private List<Long> normalizeIndustryLeafIds(List<Long> requestedIds) {
        if (CollUtil.isEmpty(requestedIds)) {
            return List.of();
        }
        List<Industry> enabled = industryAppService.listIndustries(1);
        Set<Long> parentIds = new HashSet<>();
        for (Industry item : enabled) {
            if (item.getParentId() != null) {
                parentIds.add(item.getParentId());
            }
        }
        Set<Long> enabledLeafIds = enabled.stream()
                .filter(item -> item.getId() != null)
                .filter(item -> !parentIds.contains(item.getId()))
                .map(Industry::getId)
                .collect(Collectors.toSet());
        return requestedIds.stream()
                .filter(Objects::nonNull)
                .filter(enabledLeafIds::contains)
                .distinct()
                .toList();
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
