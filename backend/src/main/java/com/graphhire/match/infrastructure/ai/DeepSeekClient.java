package com.graphhire.match.infrastructure.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import cn.hutool.core.util.StrUtil;

import java.util.HashMap;
import java.util.Map;

/**
 * DeepSeek AI客户端
 *
 * 【模块说明】调用DeepSeek云端API进行人岗匹配计算、简历解析、职位解析。
 *             AI不可用时自动降级为本地计算模式。
 *
 * 【注意事项】
 * - 需要配置 ai.deepseek.api-key 和 ai.deepseek.url
 * - API调用失败时会降级到本地计算，保证服务可用性
 */
@Component
public class DeepSeekClient {

    /** DeepSeek API密钥 */
    @Value("${ai.deepseek.api-key:}")
    private String apiKey;

    /** DeepSeek API地址，默认 https://api.deepseek.com/v1 */
    @Value("${ai.deepseek.url:https://api.deepseek.com/v1}")
    private String baseUrl;

    
    // =====================================================
    // 【第一部分】匹配计算
    // =====================================================

    /**
     * 生成匹配原因说明
     * @param resumeId 简历ID
     * @param jobId 职位ID
     * @return 匹配原因说明（AI生成或默认文本）
     */
    public String generateMatchReason(Long resumeId, Long jobId) {
        if (apiKey == null || apiKey.isBlank()) {
            return "Based on skill and experience matching";
        }

        String endpoint = baseUrl + "/chat/completions";
        Map<String, Object> requestBody = Map.of(
            "model", "deepseek-chat",
            "messages", new Object[]{
                Map.of("role", "system", "content", "You are a recruitment assistant explaining why a candidate matches a job."),
                Map.of("role", "user", "content", String.format("Explain why resume %d matches job %d", resumeId, jobId))
            }
        );

        try {
            String response = HttpRequest.post(endpoint)
                .header("Content-Type", "application/json")
                .body(JSONUtil.toJsonStr(requestBody))
                .timeout(30000)
                .execute()
                .body();
            JSONObject jsonObj = JSONUtil.parseObj(response);
            return jsonObj.getJSONArray("choices").getJSONObject(0).getJSONObject("message").getStr("content");
        } catch (Exception e) {
            return "Based on skill and experience matching";
        }
    }

    /**
     * 计算人岗匹配分数
     * 【功能说明】调用DeepSeek AI分析用户信息和职位信息，返回多维度匹配分数。
     *             AI不可用时自动降级为本地fallback计算。
     * @param userInfo 用户信息（技能、经验、学历、目标城市、期望薪资）
     * @param jobInfo 职位信息（技能要求、经验要求、学历要求、城市、薪资范围）
     * @return 匹配结果Map（包含各维度分数、总分、匹配原因、差距、建议）
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> calculateMatch(Map<String, Object> userInfo, Map<String, Object> jobInfo) {
        // AI不可用时使用降级计算
        if (apiKey == null || apiKey.isBlank()) {
            return fallbackCalculateMatch(userInfo, jobInfo);
        }

        String endpoint = baseUrl + "/chat/completions";
        Map<String, Object> requestBody = Map.of(
            "model", "deepseek-chat",
            "messages", new Object[]{
                Map.of("role", "system", "content", """
                    You are a recruitment matching AI. Calculate match scores between a candidate and job.
                    Return a JSON object with:
                    - skill_score: 0-100 based on skill matching
                    - experience_score: 0-100 based on experience matching
                    - city_score: 0-100 based on city matching
                    - education_score: 0-100 based on education matching
                    - salary_score: 0-100 based on salary range matching
                    - overall_score: weighted average (skill 50%, experience 20%, city 15%, education 10%, salary 5%)
                    - match_reasons: explanation of why they match
                    - gaps: areas where candidate doesn't meet requirements
                    - suggestions: recommendations for improvement
                    """),
                Map.of("role", "user", "content", String.format("""
                    User Info: %s
                    Job Info: %s
                    Calculate the match scores and return JSON.
                    """, userInfo, jobInfo))
            }
        );

        try {
            String response = HttpRequest.post(endpoint)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .body(JSONUtil.toJsonStr(requestBody))
                .timeout(30000)
                .execute()
                .body();
            if (response == null || response.isBlank()) {
                return fallbackCalculateMatch(userInfo, jobInfo);
            }
            return parseDeepSeekResponse(response);
        } catch (Exception e) {
            // AI不可用时降级到本地计算
            return fallbackCalculateMatch(userInfo, jobInfo);
        }
    }

    // =====================================================
    // 【第二部分】本地降级计算
    // =====================================================

    /**
     * 本地降级匹配计算
     * 当AI服务不可用时，使用基于规则的本地计算作为备选方案
     */
    private Map<String, Object> fallbackCalculateMatch(Map<String, Object> userInfo, Map<String, Object> jobInfo) {
        var userSkills = (java.util.List<String>) userInfo.getOrDefault("skills", java.util.Collections.emptyList());
        var jobSkills = (java.util.List<String>) jobInfo.getOrDefault("required_skills", java.util.Collections.emptyList());

        // 各维度分数计算
        double skillScore = calculateSkillOverlap(userSkills, jobSkills);
        double expScore = calculateExperienceScore(
            (Integer) userInfo.get("experience_years"),
            (String) jobInfo.get("experience_required")
        );
        double cityScore = calculateCityScore(
            (String) userInfo.get("target_city"),
            (String) jobInfo.get("city")
        );
        double eduScore = calculateEducationScore(
            (String) userInfo.get("education"),
            (String) jobInfo.get("education_required")
        );
        double salScore = calculateSalaryScore(
            (Integer) userInfo.get("expected_salary"),
            (java.util.List<Integer>) jobInfo.get("salary_range")
        );

        // 加权总分计算（技能50%、经验20%、城市15%、学历10%、薪资5%）
        double overallScore = skillScore * 0.5 + expScore * 0.2 + cityScore * 0.15 + eduScore * 0.1 + salScore * 0.05;

        return Map.of(
            "skill_score", skillScore,
            "experience_score", expScore,
            "city_score", cityScore,
            "education_score", eduScore,
            "salary_score", salScore,
            "overall_score", overallScore,
            "match_reasons", StrUtil.format("Skills match: {:.0f}%. Experience match: {:.0f}%.", skillScore, expScore),
            "gaps", java.util.Collections.emptyList(),
            "suggestions", java.util.Collections.emptyList()
        );
    }

    /** 计算技能匹配分数：用户技能与岗位要求技能的重叠率 */
    private double calculateSkillOverlap(java.util.List<String> userSkills, java.util.List<String> jobSkills) {
        if (jobSkills.isEmpty()) return 100.0;
        long overlap = userSkills.stream()
            .map(String::toLowerCase)
            .filter(jobSkills.stream().map(String::toLowerCase).toList()::contains)
            .count();
        return (double) overlap / jobSkills.size() * 100;
    }

    /** 计算经验匹配分数：用户经验年限是否满足岗位要求 */
    private double calculateExperienceScore(Integer userYears, String jobExpRequired) {
        if (jobExpRequired == null || jobExpRequired.isBlank()) return 100.0;
        if (userYears == null) return 50.0;

        int requiredYears = parseExperienceRequirement(jobExpRequired);
        if (requiredYears == 0) return 100.0;
        if (userYears >= requiredYears) return 100.0;
        return (double) userYears / requiredYears * 100;
    }

    /** 解析经验要求字符串，提取数字年限 */
    private int parseExperienceRequirement(String expRequired) {
        if (expRequired == null) return 0;
        if (expRequired.contains("不限")) return 0;
        var match = java.util.regex.Pattern.compile("(\\d+)").matcher(expRequired);
        if (match.find()) {
            return Integer.parseInt(match.group(1));
        }
        return 0;
    }

    /** 计算城市匹配分数：用户目标城市与岗位所在城市是否一致 */
    private double calculateCityScore(String userCity, String jobCity) {
        if (jobCity == null || jobCity.isBlank()) return 100.0;
        if (userCity == null || userCity.isBlank()) return 50.0;
        return userCity.equalsIgnoreCase(jobCity) ? 100.0 : 0.0;
    }

    /** 计算学历匹配分数：用户学历等级是否满足岗位要求 */
    private double calculateEducationScore(String userEdu, String jobEdu) {
        if (jobEdu == null || jobEdu.isBlank()) return 100.0;
        if (userEdu == null || userEdu.isBlank()) return 50.0;

        int userLevel = getEducationLevel(userEdu);
        int jobLevel = getEducationLevel(jobEdu);
        if (userLevel >= jobLevel) return 100.0;
        return (double) userLevel / jobLevel * 100;
    }

    /** 获取学历等级：博士(4) > 硕士(3) > 本科(2) > 大专(1) > 其他(0) */
    private int getEducationLevel(String education) {
        return switch (education.toUpperCase()) {
            case "博士", "PHD" -> 4;
            case "硕士", "MASTER" -> 3;
            case "本科", "BACHELOR" -> 2;
            case "大专", "ASSOCIATE" -> 1;
            default -> 0;
        };
    }

    /** 计算薪资匹配分数：用户期望薪资是否在岗位薪资范围内 */
    private double calculateSalaryScore(Integer userSalary, java.util.List<Integer> salaryRange) {
        if (salaryRange == null || salaryRange.size() < 2 || userSalary == null) return 50.0;
        int min = salaryRange.get(0);
        int max = salaryRange.get(1);
        if (userSalary >= min && userSalary <= max) return 100.0;
        int mid = (min + max) / 2;
        int diff = Math.abs(userSalary - mid);
        int range = max - min;
        if (range == 0) return 50.0;
        return Math.max(0, 100 - (double) diff / range * 100);
    }

    // =====================================================
    // 【第三部分】响应解析
    // =====================================================

    /** 解析DeepSeek API返回的响应，提取JSON结果 */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseDeepSeekResponse(String response) {
        try {
            JSONObject jsonObj = JSONUtil.parseObj(response);
            Map<String, Object> result = new HashMap<>();
            result.put("skill_score", jsonObj.getDouble("skill_score", 75.0));
            result.put("experience_score", jsonObj.getDouble("experience_score", 75.0));
            result.put("city_score", jsonObj.getDouble("city_score", 75.0));
            result.put("education_score", jsonObj.getDouble("education_score", 75.0));
            result.put("salary_score", jsonObj.getDouble("salary_score", 75.0));
            result.put("match_reasons", jsonObj.getStr("match_reasons", "Based on profile matching"));
            result.put("gaps", jsonObj.containsKey("gaps") ? jsonObj.getJSONArray("gaps") : java.util.Collections.emptyList());
            result.put("suggestions", jsonObj.containsKey("suggestions") ? jsonObj.getJSONArray("suggestions") : java.util.Collections.emptyList());

            // 如果没有overall_score，使用加权计算
            if (!result.containsKey("overall_score")) {
                double overall = 0;
                overall += (Double) result.getOrDefault("skill_score", 75.0) * 0.5;
                overall += (Double) result.getOrDefault("experience_score", 75.0) * 0.2;
                overall += (Double) result.getOrDefault("city_score", 75.0) * 0.15;
                overall += (Double) result.getOrDefault("education_score", 75.0) * 0.1;
                overall += (Double) result.getOrDefault("salary_score", 75.0) * 0.05;
                result.put("overall_score", overall);
            }
            return result;
        } catch (Exception e) {
            // 降级到默认分数
        }
        return Map.of(
            "skill_score", 75.0,
            "experience_score", 75.0,
            "city_score", 75.0,
            "education_score", 75.0,
            "salary_score", 75.0,
            "overall_score", 75.0,
            "match_reasons", "Based on profile matching",
            "gaps", java.util.Collections.emptyList(),
            "suggestions", java.util.Collections.emptyList()
        );
    }

    // =====================================================
    // 【第四部分】简历和职位解析
    // =====================================================

    /**
     * 解析简历文本
     * 【功能说明】调用AI提取简历中的结构化信息（姓名、邮箱、技能、工作经验、学历等）。
     * @param text 简历文本内容
     * @return 结构化信息Map
     */
    public Map<String, Object> parseResume(String text) {
        if (apiKey == null || apiKey.isBlank()) {
            return getMockParseResult(text);
        }

        String endpoint = baseUrl + "/chat/completions";
        String prompt = """
            You are a resume parsing assistant. Extract structured information from the following resume text.
            Return a JSON object with the following fields:
            - name: candidate's full name
            - email: candidate's email
            - phone: candidate's phone number
            - skills: array of skill tags
            - experience: array of work experiences, each with company, position, duration
            - education: array of education entries, each with school, degree, major, graduation year
            - summary: brief professional summary

            Resume text:
            """ + text;

        Map<String, Object> requestBody = Map.of(
            "model", "deepseek-chat",
            "messages", new Object[]{
                Map.of("role", "system", "content", "You are a professional resume parsing assistant. Always return valid JSON."),
                Map.of("role", "user", "content", prompt)
            }
        );

        try {
            String response = HttpRequest.post(endpoint)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .body(JSONUtil.toJsonStr(requestBody))
                .timeout(30000)
                .execute()
                .body();

            Map<String, Object> result = parseJsonResponse(response);
            if (result == null || result.isEmpty()) {
                return getMockParseResult(text);
            }
            return result;
        } catch (Exception e) {
            return getMockParseResult(text);
        }
    }

    /** 解析简历API响应为结构化Map */
    private Map<String, Object> parseJsonResponse(String response) {
        try {
            JSONObject jsonObj = JSONUtil.parseObj(response);

            // 提取 AI 回复内容
            String content = jsonObj
                .getJSONArray("choices")
                .getJSONObject(0)
                .getJSONObject("message")
                .getStr("content");

            if (content == null || content.isBlank()) {
                return getMockParseResult(content);
            }

            // 尝试解析 content 为 JSON（AI 可能返回的是纯文本）
            Map<String, Object> result = new HashMap<>();
            result.put("raw_response", content);

            // 尝试将 content 解析为 JSON
            try {
                JSONObject resumeJson = JSONUtil.parseObj(content);
                result.put("name", resumeJson.getStr("name", "Unknown"));
                result.put("email", resumeJson.getStr("email", ""));
                result.put("phone", resumeJson.getStr("phone", ""));
                result.put("skills", resumeJson.getJSONArray("skills"));
                result.put("experience", resumeJson.getJSONArray("experience"));
                result.put("education", resumeJson.getJSONArray("education"));
                result.put("summary", resumeJson.getStr("summary", ""));
            } catch (Exception e) {
                // 如果不是 JSON，尝试从文本中提取信息
                result.put("name", extractNameFromText(content));
                result.put("skills", extractSkillsFromText(content));
                result.put("summary", content.substring(0, Math.min(200, content.length())));
            }

            return result;
        } catch (Exception e) {
            // 解析失败时返回空 result，让调用方决定是否用 mock
            return null;
        }
    }

    /** 从文本中提取姓名（简单的启发式方法） */
    private String extractNameFromText(String text) {
        // 简单处理：取第一行或前 50 个字符
        if (text == null || text.isBlank()) return "Unknown";
        String[] lines = text.split("\n");
        return lines[0].trim().substring(0, Math.min(50, lines[0].trim().length()));
    }

    /** 从文本中提取技能标签（简单的启发式方法） */
    private String[] extractSkillsFromText(String text) {
        // 常见技能关键词
        String[] commonSkills = {"Java", "Python", "JavaScript", "Go", "Rust", "C++", "C#",
            "Spring", "Django", "React", "Vue", "Angular", "Node.js",
            "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP",
            "Git", "Linux", "Agile", "Scrum", "AI", "ML", "Deep Learning"};
        java.util.List<String> found = new java.util.ArrayList<>();
        String upperText = text.toUpperCase();
        for (String skill : commonSkills) {
            if (upperText.contains(skill.toUpperCase())) {
                found.add(skill);
            }
        }
        return found.isEmpty() ? new String[]{"技能解析失败"} : found.toArray(new String[0]);
    }

    /** 获取模拟简历解析结果（当AI不可用时使用） */
    private Map<String, Object> getMockParseResult(String text) {
        Map<String, Object> result = new HashMap<>();
        result.put("name", "Extracted Name");
        result.put("email", "example@email.com");
        result.put("phone", "1234567890");
        result.put("skills", new String[]{"Java", "Spring Boot", "MySQL", "React"});
        result.put("experience", new Object[]{
            Map.of("company", "Tech Corp", "position", "Software Engineer", "duration", "2020-2024")
        });
        result.put("education", new Object[]{
            Map.of("school", "University", "degree", "Bachelor", "major", "Computer Science", "graduationYear", 2020)
        });
        result.put("summary", "Experienced software developer with strong technical skills");
        return result;
    }

    /**
     * 解析职位描述文本
     * 【功能说明】调用AI从职位描述中提取结构化信息（技能要求、经验要求、学历要求、薪资范围等）。
     * @param text 职位描述文本
     * @param jobTitle 职位名称
     * @return 结构化信息Map
     */
    public Map<String, Object> parseJob(String text, String jobTitle) {
        if (apiKey == null || apiKey.isBlank()) {
            return getMockJobParseResult(text, jobTitle);
        }

        String endpoint = baseUrl + "/chat/completions";
        String prompt = """
            You are a job description parsing assistant. Extract structured information from the following job description.
            Return a JSON object with the following fields:
            - title: job title (use the provided title if suitable)
            - skills: array of required skill tags
            - requiredExperience: years of experience required
            - education: education requirement
            - salaryRange: salary range if mentioned
            - responsibilities: array of key responsibilities
            - summary: brief job summary

            Job title: %s

            Job description text:
            """ .formatted(jobTitle) + text;

        Map<String, Object> requestBody = Map.of(
            "model", "deepseek-chat",
            "messages", new Object[]{
                Map.of("role", "system", "content", "You are a professional job description parsing assistant. Always return valid JSON."),
                Map.of("role", "user", "content", prompt)
            }
        );

        try {
            String response = HttpRequest.post(endpoint)
                .header("Content-Type", "application/json")
                .body(JSONUtil.toJsonStr(requestBody))
                .timeout(30000)
                .execute()
                .body();
            return parseJobJsonResponse(response);
        } catch (Exception e) {
            return getMockJobParseResult(text, jobTitle);
        }
    }

    /** 解析职位API响应为结构化Map */
    private Map<String, Object> parseJobJsonResponse(String response) {
        try {
            JSONObject jsonObj = JSONUtil.parseObj(response);
            Map<String, Object> result = new HashMap<>();
            result.put("raw_response", response);
            result.put("skills", jsonObj.getJSONArray("skills"));
            result.put("requiredExperience", jsonObj.getStr("requiredExperience"));
            result.put("education", jsonObj.getStr("education"));
            result.put("summary", jsonObj.getStr("summary"));
            return result;
        } catch (Exception e) {
            // 降级到默认结果
        }
        Map<String, Object> result = new HashMap<>();
        result.put("raw_response", response);
        result.put("skills", new String[]{"Java", "Spring Boot", "MySQL"});
        result.put("requiredExperience", "3-5年");
        result.put("education", "本科");
        result.put("summary", "We are looking for an experienced developer");
        return result;
    }

    /** 获取模拟职位解析结果（当AI不可用时使用） */
    private Map<String, Object> getMockJobParseResult(String text, String jobTitle) {
        Map<String, Object> result = new HashMap<>();
        result.put("title", jobTitle != null ? jobTitle : "Software Engineer");
        result.put("skills", new String[]{"Java", "Spring Boot", "MySQL", "Redis", "Docker"});
        result.put("requiredExperience", "3-5年");
        result.put("education", "本科");
        result.put("responsibilities", new String[]{
            "参与系统设计和开发",
            "完成核心模块编码",
            "参与代码评审"
        });
        result.put("summary", "We are looking for a skilled software engineer to join our team");
        return result;
    }
}
