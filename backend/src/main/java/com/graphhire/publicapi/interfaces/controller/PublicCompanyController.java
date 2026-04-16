package com.graphhire.publicapi.interfaces.controller;

import com.graphhire.auth.domain.vo.AuthStatus;
import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.job.application.service.CompanyAppService;
import com.graphhire.job.domain.model.Company;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 公开企业搜索接口
 *
 * 【模块说明】提供公开的企业搜索和浏览API，无需认证即可访问。
 *            只返回已认证（VERIFIED）的企业信息。
 */
@RestController
@RequestMapping("/public/companies")
public class PublicCompanyController {

    @Autowired
    private CompanyAppService companyAppService;

    /**
     * 搜索企业列表
     * 【功能说明】分页查询已认证的企业，支持关键词筛选。
     * 【筛选条件】
     * - keyword：企业名称关键词（模糊匹配）
     * 【分页参数】
     * - page：页码（从1开始）
     * - size：每页条数
     */
    @GetMapping
    public Result<PageResult<Company>> searchCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        // 步骤1：获取所有已认证企业
        List<Company> allApprovedCompanies = companyAppService.getCompaniesByAuthStatus(AuthStatus.VERIFIED);

        // 步骤2：应用关键词筛选
        List<Company> filteredCompanies = allApprovedCompanies.stream()
                .filter(company -> matchesKeyword(company, keyword))
                .collect(Collectors.toList());

        // 步骤3：计算分页
        int total = filteredCompanies.size();
        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, total);

        List<Company> pagedCompanies = fromIndex < total
                ? filteredCompanies.subList(fromIndex, toIndex)
                : List.of();

        // 步骤4：构建分页结果
        PageResult<Company> pageResult = new PageResult<>(pagedCompanies, (long) total, page, size);

        return Result.success(pageResult);
    }

    /**
     * 获取企业详情
     * 【功能说明】根据ID查询已认证企业的详细信息。
     * @param id 企业ID
     * @return 企业详情
     */
    @GetMapping("/{id}")
    public Result<Company> getCompany(@PathVariable Long id) {
        Company company = companyAppService.getCompanyById(id);

        // 只返回已认证的企业详情
        if (company.getAuthStatus() != AuthStatus.VERIFIED) {
            throw new IllegalArgumentException("企业不存在或未认证");
        }

        return Result.success(company);
    }

    /**
     * 关键词匹配（模糊匹配企业名称）
     */
    private boolean matchesKeyword(Company company, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String lowerKeyword = keyword.toLowerCase();
        return company.getName() != null && company.getName().toLowerCase().contains(lowerKeyword);
    }
}
