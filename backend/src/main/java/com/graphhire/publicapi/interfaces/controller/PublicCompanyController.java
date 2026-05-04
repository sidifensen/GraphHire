package com.graphhire.publicapi.interfaces.controller;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.industry.application.service.IndustryAppService;
import com.graphhire.industry.domain.model.Industry;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.interfaces.dto.response.CompanyAvatarUrlResolver;
import com.graphhire.publicapi.interfaces.dto.response.PublicCompanyCardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/public/companies")
public class PublicCompanyController {

    @Autowired
    private CompanyAppService companyAppService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CompanyAvatarUrlResolver companyAvatarUrlResolver;

    @Autowired
    private IndustryAppService industryAppService;

    @GetMapping
    public Result<PageResult<PublicCompanyCardResponse>> searchCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<Long> industryLeafIds,
            @RequestParam(required = false) String companyScaleCode,
            @RequestParam(required = false) List<String> cityList,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        List<Company> allApprovedCompanies = companyAppService.getCompaniesByAuthStatus(AuthStatus.VERIFIED);
        List<Long> normalizedIndustryLeafIds = normalizeIndustryLeafIds(industryLeafIds);
        List<String> normalizedCityList = normalizeCityList(cityList);
        String normalizedScaleCode = StrUtil.trim(companyScaleCode);
        Map<Long, String> industryNameMap = loadIndustryNameMap();

        List<Company> filteredCompanies = allApprovedCompanies.stream()
                .filter(company -> matchesKeyword(company, keyword))
                .filter(company -> matchesIndustry(company, normalizedIndustryLeafIds))
                .filter(company -> matchesScale(company, normalizedScaleCode))
                .collect(Collectors.toList());

        List<PublicCompanyCardResponse> cards = filteredCompanies.stream()
                .map(company -> toCard(company, industryNameMap))
                .filter(card -> matchesCity(card.city(), normalizedCityList))
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
        return Result.success(toCard(company, loadIndustryNameMap()));
    }

    private PublicCompanyCardResponse toCard(Company company, Map<Long, String> industryNameMap) {
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
                StrUtil.trim(company.getDescription()),
                StrUtil.trim(company.getAddress()),
                company.getAuthStatus().name(),
                companyAvatarUrlResolver.resolve(company.getAvatarPath()),
                company.getIndustryId(),
                company.getIndustryId() == null ? null : industryNameMap.get(company.getIndustryId()),
                StrUtil.trim(company.getScale()),
                StrUtil.trim(company.getUnifiedSocialCreditCode()),
                StrUtil.trim(company.getContactName()),
                StrUtil.trim(company.getContactPhone()),
                StrUtil.trim(company.getWebsite())
        );
    }

    private boolean matchesKeyword(Company company, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String lowerKeyword = keyword.toLowerCase();
        return company.getName() != null && company.getName().toLowerCase().contains(lowerKeyword);
    }

    private boolean matchesIndustry(Company company, List<Long> industryLeafIds) {
        if (CollUtil.isEmpty(industryLeafIds)) {
            return true;
        }
        return company.getIndustryId() != null && industryLeafIds.contains(company.getIndustryId());
    }

    private boolean matchesScale(Company company, String companyScaleCode) {
        if (StrUtil.isBlank(companyScaleCode)) {
            return true;
        }
        return StrUtil.equals(companyScaleCode, StrUtil.trim(company.getScale()));
    }

    private boolean matchesCity(String city, List<String> cityList) {
        if (CollUtil.isEmpty(cityList)) {
            return true;
        }
        return StrUtil.isNotBlank(city) && cityList.contains(StrUtil.trim(city));
    }

    private List<Long> normalizeIndustryLeafIds(List<Long> industryLeafIds) {
        if (CollUtil.isEmpty(industryLeafIds)) {
            return List.of();
        }
        List<Industry> enabled = industryAppService.listIndustries(1);
        List<Long> parentIds = enabled.stream()
                .map(Industry::getParentId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        List<Long> leafIds = enabled.stream()
                .map(Industry::getId)
                .filter(Objects::nonNull)
                .filter(id -> !parentIds.contains(id))
                .toList();
        return industryLeafIds.stream()
                .filter(Objects::nonNull)
                .filter(leafIds::contains)
                .distinct()
                .toList();
    }

    private List<String> normalizeCityList(List<String> cityList) {
        if (CollUtil.isEmpty(cityList)) {
            return List.of();
        }
        return cityList.stream()
                .filter(StrUtil::isNotBlank)
                .map(StrUtil::trim)
                .distinct()
                .toList();
    }

    private Map<Long, String> loadIndustryNameMap() {
        return industryAppService.listIndustries(1).stream()
                .filter(industry -> industry.getId() != null)
                .collect(Collectors.toMap(Industry::getId, Industry::getName, (left, right) -> left));
    }
}
