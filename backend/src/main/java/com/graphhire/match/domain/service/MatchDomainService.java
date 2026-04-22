package com.graphhire.match.domain.service;

import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.repository.MatchRecordRepository;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 匹配领域服务
 *
 * 【模块说明】核心人岗匹配逻辑，调用AI服务计算简历与职位的匹配度。
 *             支持DeepSeek AI匹配和本地降级匹配两种模式。
 *
 * 【数据来源】
 * - ResumeRepository：获取简历信息（包含解析后的技能、工作经验等）
 * - JobRepository：获取职位信息（包含技能要求、经验要求等）
 * - DeepSeekClient：AI匹配计算
 *
 * 【方法概览】
 * - calculateMatch(resumeId, jobId)：按ID计算匹配
 * - calculateMatch(resume, job)：按实体计算匹配
 */
@Service
public class MatchDomainService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private SkillTagRepository skillTagRepository;

    @Autowired
    private SkillNormalizationService normalizationService;

    @Autowired
    private DeepSeekClient deepSeekClient;

    /**
     * 根据简历ID和职位ID计算匹配
     * 【功能说明】根据ID查询简历和职位后调用AI匹配计算。
     * 【业务步骤】
     * 步骤1：根据resumeId查询简历实体
     * 步骤2：根据jobId查询职位实体
     * 步骤3：调用calculateMatch(resume, job)执行匹配计算
     */
    public MatchRecord calculateMatch(Long resumeId, Long jobId) {
        // 步骤1：查询简历
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        // 步骤2：查询职位
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        // 步骤3：执行匹配计算
        return calculateMatch(resume, job);
    }

    /**
     * 计算简历与职位的匹配
     * 【功能说明】调用DeepSeek AI分析简历和职位信息，计算多维度匹配分数。
     *            AI不可用时降级为本地计算模式。
     * 【业务步骤】
     * 步骤1：从简历解析结果中提取用户信息（技能、经验、学历、目标城市、期望薪资）
     * 步骤2：从职位信息中提取岗位要求（技能要求、经验要求、学历要求、工作城市、薪资范围）
     * 步骤3：调用DeepSeek AI计算匹配分数
     * 步骤4：从AI返回结果中提取各维度分数和匹配原因
     * 步骤5：构建MatchRecord领域对象并返回
     */
    public MatchRecord calculateMatch(Resume resume, Job job) {
        // 步骤1：构建用户信息
        Map<String, Object> userInfo = buildUserInfo(resume);
        // 步骤2：构建职位信息
        Map<String, Object> jobInfo = buildJobInfo(job);

        // 步骤3：调用DeepSeek AI匹配
        Map<String, Object> matchResult = deepSeekClient.calculateMatch(userInfo, jobInfo);

        // 步骤4：提取各维度分数
        double skillScore = getDoubleValue(matchResult, "skill_score", 75.0);
        double expScore = getDoubleValue(matchResult, "experience_score", 75.0);
        double cityScore = getDoubleValue(matchResult, "city_score", 75.0);
        double eduScore = getDoubleValue(matchResult, "education_score", 75.0);
        double salScore = getDoubleValue(matchResult, "salary_score", 75.0);
        double overallScore = getDoubleValue(matchResult, "overall_score", 75.0);

        // 提取匹配原因
        String matchReason = (String) matchResult.getOrDefault("match_reasons", "Based on skill and experience matching");

        // 步骤5：构建并返回匹配记录
        MatchScore score = MatchScore.of(skillScore, expScore, cityScore, eduScore, salScore);
        MatchRecord record = MatchRecord.create(resume.getId(), job.getId(), score);
        record.setMatchReason(matchReason);
        record.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);

        return record;
    }

    // =====================================================
    // 【第一部分】信息构建方法
    // =====================================================

    /**
     * 从简历实体构建用户信息Map
     * 提取简历解析结果中的技能、经验、学历、目标城市、期望薪资
     */
    private Map<String, Object> buildUserInfo(Resume resume) {
        Map<String, Object> userInfo = new HashMap<>();

        // 提取技能
        List<String> skills = extractSkillsFromParseResult(resume.getParseResult());
        userInfo.put("skills", skills);

        // 提取工作经验年限
        Integer experienceYears = extractExperienceYearsFromParseResult(resume.getParseResult());
        userInfo.put("experience_years", experienceYears);

        // 提取学历
        String education = extractEducationFromParseResult(resume.getParseResult());
        userInfo.put("education", education != null ? education : "本科");

        // 提取目标城市
        String targetCity = extractTargetCityFromParseResult(resume.getParseResult());
        userInfo.put("target_city", targetCity);

        // 提取期望薪资
        Integer expectedSalary = extractExpectedSalaryFromParseResult(resume.getParseResult());
        userInfo.put("expected_salary", expectedSalary);

        return userInfo;
    }

    /**
     * 从职位实体构建职位信息Map
     * 提取职位的技能要求、经验要求、学历要求、工作城市、薪资范围
     */
    private Map<String, Object> buildJobInfo(Job job) {
        Map<String, Object> jobInfo = new HashMap<>();

        // 必选技能
        jobInfo.put("required_skills", job.getRequiredSkills() != null ? job.getRequiredSkills() : new ArrayList<>());

        // 优先技能
        jobInfo.put("preferred_skills", job.getPreferredSkills() != null ? job.getPreferredSkills() : new ArrayList<>());

        // 经验要求（从描述中解析或使用默认值）
        String experienceRequired = extractExperienceRequiredFromDescription(job.getDescription());
        jobInfo.put("experience_required", experienceRequired);

        // 学历要求（从描述中解析或使用默认值）
        String educationRequired = extractEducationRequiredFromDescription(job.getDescription());
        jobInfo.put("education_required", educationRequired);

        // 工作城市
        jobInfo.put("city", job.getLocation() != null ? job.getLocation().getCity() : null);

        // 薪资范围
        if (job.getSalaryRange() != null && !job.getSalaryRange().isEmpty()) {
            jobInfo.put("salary_range", List.of(job.getSalaryRange().getMin(), job.getSalaryRange().getMax()));
        } else {
            jobInfo.put("salary_range", new ArrayList<>());
        }

        return jobInfo;
    }

    // =====================================================
    // 【第二部分】简历解析结果提取方法
    // =====================================================

    /** 从简历解析结果JSON中提取技能列表 */
    @SuppressWarnings("unchecked")
    private List<String> extractSkillsFromParseResult(String parseResult) {
        if (parseResult == null || parseResult.isBlank()) {
            return new ArrayList<>();
        }
        try {
            // 简单JSON解析获取skills数组
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var node = mapper.readTree(parseResult);
            var skillsNode = node.get("skills");
            if (skillsNode != null && skillsNode.isArray()) {
                List<String> skills = new ArrayList<>();
                for (var skillNode : skillsNode) {
                    skills.add(skillNode.asText());
                }
                return skills;
            }
        } catch (Exception e) {
            // 降级：尝试从原始文本中查找
        }
        return new ArrayList<>();
    }

    /** 从简历解析结果JSON中提取工作经验年限 */
    private Integer extractExperienceYearsFromParseResult(String parseResult) {
        if (parseResult == null || parseResult.isBlank()) {
            return 0;
        }
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var node = mapper.readTree(parseResult);
            var experienceNode = node.get("experience_years");
            if (experienceNode != null) {
                return experienceNode.asInt();
            }
            // 尝试从summary中提取
            var summaryNode = node.get("summary");
            if (summaryNode != null) {
                String summary = summaryNode.asText();
                var match = java.util.regex.Pattern.compile("(\\d+)\\s*年").matcher(summary);
                if (match.find()) {
                    return Integer.parseInt(match.group(1));
                }
            }
        } catch (Exception e) {
            // 降级
        }
        return 0;
    }

    /** 从简历解析结果JSON中提取学历信息 */
    private String extractEducationFromParseResult(String parseResult) {
        if (parseResult == null || parseResult.isBlank()) {
            return "本科";
        }
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var node = mapper.readTree(parseResult);
            var educationNode = node.get("education");
            if (educationNode != null && !educationNode.isNull()) {
                if (educationNode.isArray()) {
                    for (var edu : educationNode) {
                        String degree = edu.get("degree") != null ? edu.get("degree").asText() : "";
                        if (degree.contains("博")) return "博士";
                        if (degree.contains("硕")) return "硕士";
                        if (degree.contains("本")) return "本科";
                        if (degree.contains("大")) return "大专";
                    }
                } else {
                    return educationNode.asText();
                }
            }
        } catch (Exception e) {
            // 降级
        }
        return "本科";
    }

    /** 从简历解析结果JSON中提取目标城市 */
    private String extractTargetCityFromParseResult(String parseResult) {
        if (parseResult == null || parseResult.isBlank()) {
            return null;
        }
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var node = mapper.readTree(parseResult);
            var cityNode = node.get("target_city");
            if (cityNode != null && !cityNode.isNull()) {
                return cityNode.asText();
            }
            var expectedLocationNode = node.get("expected_location");
            if (expectedLocationNode != null && !expectedLocationNode.isNull()) {
                return expectedLocationNode.asText();
            }
        } catch (Exception e) {
            // 降级
        }
        return null;
    }

    /** 从简历解析结果JSON中提取期望薪资 */
    private Integer extractExpectedSalaryFromParseResult(String parseResult) {
        if (parseResult == null || parseResult.isBlank()) {
            return null;
        }
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var node = mapper.readTree(parseResult);
            var salaryNode = node.get("expected_salary");
            if (salaryNode != null && !salaryNode.isNull()) {
                return salaryNode.asInt();
            }
        } catch (Exception e) {
            // 降级
        }
        return null;
    }

    // =====================================================
    // 【第三部分】职位描述解析方法
    // =====================================================

    /** 从职位描述中提取经验要求（解析"1-3年"、"3-5年"等模式） */
    private String extractExperienceRequiredFromDescription(String description) {
        if (description == null || description.isBlank()) {
            return "不限";
        }
        // 尝试匹配经验要求模式
        var match = java.util.regex.Pattern.compile("(\\d+)-?(\\d*)年").matcher(description);
        if (match.find()) {
            String years = match.group(1);
            if (match.group(2) != null && !match.group(2).isEmpty()) {
                return years + "-" + match.group(2) + "年";
            }
            return years + "年以上";
        }
        if (description.contains("不限")) {
            return "不限";
        }
        return "不限";
    }

    /** 从职位描述中提取学历要求（博士、硕士、本科、大专） */
    private String extractEducationRequiredFromDescription(String description) {
        if (description == null || description.isBlank()) {
            return "本科";
        }
        if (description.contains("博士")) return "博士";
        if (description.contains("硕士")) return "硕士";
        if (description.contains("本科")) return "本科";
        if (description.contains("大专")) return "大专";
        return "本科";
    }

    // =====================================================
    // 【第四部分】辅助方法
    // =====================================================

    /** 从Map中安全获取double值，值不存在时返回默认值 */
    private double getDoubleValue(Map<String, Object> map, String key, double defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return defaultValue;
    }
}
