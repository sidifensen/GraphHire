package com.graphhire.publicapi.interfaces.controller;

import cn.hutool.core.collection.CollUtil;
import com.graphhire.common.vo.PageResult;
import com.graphhire.common.vo.Result;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.vo.JobStatus;
import com.graphhire.job.domain.vo.Location;
import com.graphhire.job.domain.vo.SalaryRange;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 公开职位搜索接口
 *
 * 【模块说明】提供公开的职位搜索和浏览API，无需认证即可访问。
 *            支持按关键词、城市、薪资范围、技能等条件筛选职位。
 */
@RestController
@RequestMapping("/public/jobs")
public class PublicJobController {

    @Autowired
    private JobRepository jobRepository;

    /**
     * 搜索职位列表
     * 【功能说明】分页查询已发布的职位，支持关键词、城市、薪资范围、技能等筛选条件。
     * 【筛选条件】
     * - keyword：职位名称关键词（模糊匹配）
     * - city：工作城市（精确匹配）
     * - salaryMin：最低薪资
     * - salaryMax：最高薪资
     * - skills：技能列表（任一匹配）
     * - sortBy：排序字段（createTime/salary）
     * 【分页参数】
     * - page：页码（从1开始）
     * - size：每页条数
     */
    @GetMapping
    public Result<PageResult<Job>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer salaryMin,
            @RequestParam(required = false) Integer salaryMax,
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false, defaultValue = "createTime") String sortBy,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        // 步骤1：获取所有已发布职位
        List<Job> allPublishedJobs = jobRepository.findByStatus(JobStatus.PUBLISHED);

        // 步骤2：应用筛选条件
        List<Job> filteredJobs = allPublishedJobs.stream()
                .filter(job -> matchesKeyword(job, keyword))
                .filter(job -> matchesCity(job, city))
                .filter(job -> matchesSalaryRange(job, salaryMin, salaryMax))
                .filter(job -> matchesSkills(job, skills))
                .collect(Collectors.toList());

        // 步骤3：应用排序
        List<Job> sortedJobs = applySort(filteredJobs, sortBy);

        // 步骤4：计算分页
        int total = sortedJobs.size();
        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, total);

        List<Job> pagedJobs = fromIndex < total
                ? sortedJobs.subList(fromIndex, toIndex)
                : List.of();

        // 步骤5：构建分页结果
        PageResult<Job> pageResult = new PageResult<>(pagedJobs, (long) total, page, size);

        return Result.success(pageResult);
    }

    /**
     * 获取职位详情
     * 【功能说明】根据ID查询已发布职位的详细信息。
     * @param id 职位ID
     * @return 职位详情
     */
    @GetMapping("/{id}")
    public Result<Job> getJob(@PathVariable Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("职位不存在"));

        // 只返回已发布的职位详情
        if (job.getStatus() != JobStatus.PUBLISHED) {
            throw new IllegalArgumentException("职位不存在或已下架");
        }

        return Result.success(job);
    }

    /**
     * 关键词匹配（模糊匹配职位名称）
     */
    private boolean matchesKeyword(Job job, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String lowerKeyword = keyword.toLowerCase();
        return (job.getTitle() != null && job.getTitle().toLowerCase().contains(lowerKeyword))
                || (job.getDescription() != null && job.getDescription().toLowerCase().contains(lowerKeyword));
    }

    /**
     * 城市匹配（精确匹配工作城市）
     */
    private boolean matchesCity(Job job, String city) {
        if (city == null || city.isBlank()) {
            return true;
        }
        Location location = job.getLocation();
        if (location == null) {
            return false;
        }
        return city.equals(location.getCity());
    }

    /**
     * 薪资范围匹配
     */
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

    /**
     * 技能匹配（任一技能匹配即可）
     */
    private boolean matchesSkills(Job job, List<String> skills) {
        if (CollUtil.isEmpty(skills)) {
            return true;
        }
        List<String> requiredSkills = job.getRequiredSkills();
        if (CollUtil.isEmpty(requiredSkills)) {
            return false;
        }

        return skills.stream()
                .anyMatch(skill -> requiredSkills.stream()
                        .anyMatch(required -> required.equalsIgnoreCase(skill)));
    }

    /**
     * 应用排序
     */
    private List<Job> applySort(List<Job> jobs, String sortBy) {
        if (jobs == null || jobs.isEmpty()) {
            return jobs;
        }
        return switch (sortBy.toLowerCase()) {
            case "salary" -> jobs.stream()
                    .sorted((j1, j2) -> {
                        SalaryRange s1 = j1.getSalaryRange();
                        SalaryRange s2 = j2.getSalaryRange();
                        Integer max1 = s1 != null ? s1.getMax() : null;
                        Integer max2 = s2 != null ? s2.getMax() : null;
                        if (max1 == null && max2 == null) return 0;
                        if (max1 == null) return 1;
                        if (max2 == null) return -1;
                        return max2.compareTo(max1); // 薪资高的在前
                    })
                    .collect(Collectors.toList());
            default -> jobs; // 默认按创建时间（原始顺序）
        };
    }
}
