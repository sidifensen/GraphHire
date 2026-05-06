package com.graphhire.match.infrastructure.ai;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import cn.hutool.core.thread.ThreadUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;

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

    private static final Logger log = LoggerFactory.getLogger(DeepSeekClient.class);
    private static final String CHAT_COMPLETIONS_PATH = "/chat/completions";
    private static final String DEFAULT_MATCH_REASON = "Based on skill and experience matching";

    /** DeepSeek API密钥 */
    @Value("${ai.deepseek.api-key:}")
    private String apiKey;

    /** DeepSeek API地址，默认 https://api.deepseek.com/v1 */
    @Value("${ai.deepseek.url:https://api.deepseek.com/v1}")
    private String baseUrl;

    @Value("${ai.deepseek.enabled:true}")
    private boolean enabled;

    @Value("${ai.deepseek.timeout-ms:30000}")
    private int timeoutMs;

    @Value("${ai.deepseek.retry.max-attempts:2}")
    private int maxRetryAttempts;

    @Value("${ai.deepseek.retry.backoff-ms:200}")
    private long retryBackoffMs;

    // 提示词内容
    private String calculateMatchSystemPrompt;
    private String calculateMatchUserPrompt;
    private String parseResumeSystemPrompt;
    private String parseResumeUserPrompt;
    private String parseJobSystemPrompt;
    private String parseJobUserPrompt;
    private String generateMatchReasonSystemPrompt;
    private String generateMatchReasonUserPrompt;
    private String industryFirstPassSystemPrompt;
    private String industryFirstPassUserPrompt;
    private String industrySecondPassSystemPrompt;
    private String industrySecondPassUserPrompt;
    private String industrySkillCategorizeSystemPrompt;
    private String industrySkillCategorizeUserPrompt;
    private String industryProfileGenerateSystemPrompt;
    private String industryProfileGenerateUserPrompt;

    public DeepSeekClient() {
        loadPrompts();
    }

    private void loadPrompts() {
        calculateMatchSystemPrompt = loadPrompt("prompts/calculate-match.md", "## system prompt");
        calculateMatchUserPrompt = loadPrompt("prompts/calculate-match.md", "## user prompt");
        parseResumeSystemPrompt = loadPrompt("prompts/parse-resume.md", "## system prompt");
        parseResumeUserPrompt = loadPrompt("prompts/parse-resume.md", "## user prompt");
        parseJobSystemPrompt = loadPrompt("prompts/parse-job.md", "## system prompt");
        parseJobUserPrompt = loadPrompt("prompts/parse-job.md", "## user prompt");
        generateMatchReasonSystemPrompt = loadPrompt("prompts/generate-match-reason.md", "## DeepSeek", "## system prompt");
        generateMatchReasonUserPrompt = loadPrompt("prompts/generate-match-reason.md", "## user prompt", "---");
        industryFirstPassSystemPrompt = loadPrompt("prompts/industry-first-pass.md", "## system prompt");
        industryFirstPassUserPrompt = loadPrompt("prompts/industry-first-pass.md", "## user prompt");
        industrySecondPassSystemPrompt = loadPrompt("prompts/industry-second-pass.md", "## system prompt");
        industrySecondPassUserPrompt = loadPrompt("prompts/industry-second-pass.md", "## user prompt");
        industrySkillCategorizeSystemPrompt = loadPrompt("prompts/industry-skill-categorize.md", "## system prompt");
        industrySkillCategorizeUserPrompt = loadPrompt("prompts/industry-skill-categorize.md", "## user prompt");
        industryProfileGenerateSystemPrompt = loadPrompt("prompts/industry-profile-generate.md", "## system prompt");
        industryProfileGenerateUserPrompt = loadPrompt("prompts/industry-profile-generate.md", "## user prompt");
    }

    private String loadPrompt(String resourcePath, String... sectionMarkers) {
        try {
            ClassPathResource resource = new ClassPathResource(resourcePath);
            String content;
            try (InputStream is = resource.getInputStream()) {
                content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
            if (sectionMarkers.length == 0) {
                return content.trim();
            }
            String section = sectionMarkers[0];
            int start = content.indexOf(section);
            if (start == -1) {
                log.warn("提示词片段'{}'在{}中未找到，使用空字符串", section, resourcePath);
                return "";
            }
            start = content.indexOf("\n", start) + 1;
            if (sectionMarkers.length > 1) {
                int end = content.indexOf(sectionMarkers[1], start);
                if (end == -1) {
                    end = content.length();
                }
                return content.substring(start, end).trim();
            }
            return content.substring(start).trim();
        } catch (IOException e) {
            log.error("加载提示词文件{}失败: {}", resourcePath, e.getMessage());
            return "";
        }
    }

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
        if (!isAiAvailable("generateMatchReason")) {
            return DEFAULT_MATCH_REASON;
        }

        ChatCompletionResult result = invokeChatCompletionWithMetrics(
            "generateMatchReason",
            generateMatchReasonSystemPrompt,
            String.format(generateMatchReasonUserPrompt, resumeId, jobId)
        );
        String content = result.content();
        if (StrUtil.isBlank(content)) {
            log.warn("AI生成匹配结果降级：返回内容为空，resumeId={}, jobId={}", resumeId, jobId);
            return DEFAULT_MATCH_REASON;
        }

        if (result.attemptCount() <= 1) {
            log.info("AI生成匹配结果成功：使用AI结果，resumeId={}, jobId={}, 请求次数={}, 单次耗时={}ms",
                resumeId, jobId, result.attemptCount(), result.lastAttemptCostMs());
        } else {
            log.info("AI生成匹配结果成功：使用AI结果，resumeId={}, jobId={}, 请求次数={}, 单次耗时={}ms, 总耗时={}ms",
                resumeId, jobId, result.attemptCount(), result.lastAttemptCostMs(), result.totalCostMs());
        }
        return content.trim();
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
        if (!isAiAvailable("calculateMatch")) {
            return fallbackCalculateMatch(userInfo, jobInfo);
        }

        String content = invokeChatCompletion(
            "calculateMatch",
            calculateMatchSystemPrompt,
            String.format(calculateMatchUserPrompt, userInfo, jobInfo)
        );

        if (StrUtil.isBlank(content)) {
            log.warn("AI计算人岗匹配分数降级：响应内容为空");
            return fallbackCalculateMatch(userInfo, jobInfo);
        }

        Map<String, Object> result = parseDeepSeekResponse(content);
        if (result == null || result.isEmpty()) {
            log.warn("AI计算人岗匹配分数降级：无法解析AI返回的JSON内容");
            return fallbackCalculateMatch(userInfo, jobInfo);
        }

        log.info("AI计算人岗匹配分数成功：使用AI评分结果");
        return result;
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

        double overallScore = skillScore * 0.5 + expScore * 0.2 + cityScore * 0.15 + eduScore * 0.1 + salScore * 0.05;

        return Map.of(
            "skill_score", skillScore,
            "experience_score", expScore,
            "city_score", cityScore,
            "education_score", eduScore,
            "salary_score", salScore,
            "overall_score", overallScore,
            "match_reasons", StrUtil.format("Skills match: {}%. Experience match: {}%.", Math.round(skillScore), Math.round(expScore)),
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
    private Map<String, Object> parseDeepSeekResponse(String content) {
        try {
            JSONObject jsonObj = JSONUtil.parseObj(cleanJsonContent(content));
            Map<String, Object> result = new HashMap<>();
            result.put("skill_score", jsonObj.getDouble("skill_score", 75.0));
            result.put("experience_score", jsonObj.getDouble("experience_score", 75.0));
            result.put("city_score", jsonObj.getDouble("city_score", 75.0));
            result.put("education_score", jsonObj.getDouble("education_score", 75.0));
            result.put("salary_score", jsonObj.getDouble("salary_score", 75.0));
            result.put("match_reasons", jsonObj.getStr("match_reasons", "Based on profile matching"));
            result.put("gaps", jsonObj.containsKey("gaps") ? jsonObj.getJSONArray("gaps") : java.util.Collections.emptyList());
            result.put("suggestions", jsonObj.containsKey("suggestions") ? jsonObj.getJSONArray("suggestions") : java.util.Collections.emptyList());
            result.put("overall_score", jsonObj.getDouble("overall_score", calculateOverallScore(result)));
            return result;
        } catch (Exception e) {
            log.warn("AI计算人岗匹配分数解析失败: {}", safeMessage(e));
            return null;
        }
    }

    private double calculateOverallScore(Map<String, Object> result) {
        double overall = 0;
        overall += ((Number) result.getOrDefault("skill_score", 75.0)).doubleValue() * 0.5;
        overall += ((Number) result.getOrDefault("experience_score", 75.0)).doubleValue() * 0.2;
        overall += ((Number) result.getOrDefault("city_score", 75.0)).doubleValue() * 0.15;
        overall += ((Number) result.getOrDefault("education_score", 75.0)).doubleValue() * 0.1;
        overall += ((Number) result.getOrDefault("salary_score", 75.0)).doubleValue() * 0.05;
        return overall;
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
        if (!isAiAvailable("parseResume")) {
            return getMockParseResult(text);
        }

        String content = invokeChatCompletion(
            "parseResume",
            parseResumeSystemPrompt,
            String.format(parseResumeUserPrompt, text)
        );
        if (StrUtil.isBlank(content)) {
            log.warn("AI解析简历降级：响应内容为空");
            return getMockParseResult(text);
        }

        Map<String, Object> result = parseResumeContent(content);
        if (result == null || result.isEmpty()) {
            log.warn("AI解析简历降级：无法构建结构化结果");
            return getMockParseResult(text);
        }

        log.info("AI解析简历成功：使用AI解析结果");
        return result;
    }

    /** 从文本中解析简历结构 */
    private Map<String, Object> parseResumeContent(String content) {
        String cleanedContent = cleanJsonContent(content);
        try {
            JSONObject resumeJson = JSONUtil.parseObj(cleanedContent);
            Map<String, Object> result = new HashMap<>();
            result.put("raw_response", content);
            result.put("name", resumeJson.getStr("name", "Unknown"));
            result.put("email", resumeJson.getStr("email", ""));
            result.put("phone", resumeJson.getStr("phone", ""));
            result.put("skills", resumeJson.containsKey("skills") ? resumeJson.getJSONArray("skills") : new JSONArray());
            result.put("experience", resumeJson.containsKey("experience") ? resumeJson.getJSONArray("experience") : new JSONArray());
            result.put("education", resumeJson.containsKey("education") ? resumeJson.getJSONArray("education") : new JSONArray());
            result.put("summary", resumeJson.getStr("summary", ""));
            return result;
        } catch (Exception e) {
            log.warn("AI解析简历JSON解析失败，改用文本提取降级方案: {}", safeMessage(e));
            Map<String, Object> result = new HashMap<>();
            result.put("raw_response", content);
            result.put("name", extractNameFromText(content));
            result.put("email", "");
            result.put("phone", "");
            result.put("skills", extractSkillsFromText(content));
            result.put("experience", new Object[0]);
            result.put("education", new Object[0]);
            result.put("summary", content.substring(0, Math.min(200, content.length())));
            return result;
        }
    }

    /** 从文本中提取姓名（简单的启发式方法） */
    private String extractNameFromText(String text) {
        if (text == null || text.isBlank()) return "Unknown";
        String[] lines = text.split("\\n");
        return lines[0].trim().substring(0, Math.min(50, lines[0].trim().length()));
    }

    /** 从文本中提取技能标签（简单的启发式方法） */
    private String[] extractSkillsFromText(String text) {
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
        if (!isAiAvailable("parseJob")) {
            return getMockJobParseResult(text, jobTitle);
        }

        String content = invokeChatCompletion(
            "parseJob",
            parseJobSystemPrompt,
            String.format(parseJobUserPrompt, jobTitle, text)
        );
        if (StrUtil.isBlank(content)) {
            log.warn("AI解析职位降级：响应内容为空");
            return getMockJobParseResult(text, jobTitle);
        }

        Map<String, Object> result = parseJobJsonResponse(content);
        if (result == null || result.isEmpty()) {
            log.warn("AI解析职位降级：无法解析AI返回的JSON内容");
            return getMockJobParseResult(text, jobTitle);
        }

        log.info("AI解析职位成功：使用AI解析结果");
        return result;
    }

    /** 解析职位API响应为结构化Map */
    private Map<String, Object> parseJobJsonResponse(String content) {
        try {
            JSONObject jsonObj = JSONUtil.parseObj(cleanJsonContent(content));
            Map<String, Object> result = new HashMap<>();
            result.put("raw_response", content);
            result.put("skills", jsonObj.containsKey("skills") ? jsonObj.getJSONArray("skills") : new JSONArray());
            result.put("requiredExperience", jsonObj.getStr("requiredExperience"));
            result.put("education", jsonObj.getStr("education"));
            result.put("summary", jsonObj.getStr("summary"));
            if (jsonObj.containsKey("title")) {
                result.put("title", jsonObj.getStr("title"));
            }
            if (jsonObj.containsKey("responsibilities")) {
                result.put("responsibilities", jsonObj.getJSONArray("responsibilities"));
            }
            if (jsonObj.containsKey("salaryRange")) {
                result.put("salaryRange", jsonObj.get("salaryRange"));
            }
            return result;
        } catch (Exception e) {
            log.warn("AI解析职位JSON解析失败: {}", safeMessage(e));
            return null;
        }
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

    private boolean isAiAvailable(String operation) {
        boolean available = enabled && StrUtil.isNotBlank(apiKey);
        if (!available) {
            log.info("AI{}降级：AI未启用或API Key缺失", getOperationLabel(operation));
        }
        return available;
    }

    private String invokeChatCompletion(String operation, String systemPrompt, String userPrompt) {
        ChatCompletionResult result = invokeChatCompletionWithMetrics(operation, systemPrompt, userPrompt);
        return result.content();
    }

    private ChatCompletionResult invokeChatCompletionWithMetrics(String operation, String systemPrompt, String userPrompt) {
        long totalStartNanos = System.nanoTime();
        String endpoint = StrUtil.removeSuffix(baseUrl, "/") + CHAT_COMPLETIONS_PATH;
        Map<String, Object> requestBody = Map.of(
            "model", "deepseek-chat",
            "messages", new Object[]{
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            }
        );

        int attempts = Math.max(maxRetryAttempts, 1);
        for (int attempt = 1; attempt <= attempts; attempt++) {
            long attemptStartNanos = System.nanoTime();
            try {
                HttpResponse response = HttpRequest.post(endpoint)
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .body(JSONUtil.toJsonStr(requestBody))
                    .timeout(timeoutMs)
                    .execute();

                int status = response.getStatus();
                String responseBody = response.body();
                if (status < 200 || status >= 300) {
                    log.warn("AI{}请求第{}/{}次失败：HTTP状态码={}，单次耗时={}ms，总耗时={}ms，响应摘要={}",
                        getOperationLabel(operation), attempt, attempts, status,
                        elapsedMs(attemptStartNanos), elapsedMs(totalStartNanos), summarize(responseBody));
                    if (attempt < attempts) {
                        ThreadUtil.safeSleep(retryBackoffMs * attempt);
                        continue;
                    }
                    return new ChatCompletionResult(null, attempt, elapsedMs(attemptStartNanos), elapsedMs(totalStartNanos));
                }
                if (StrUtil.isBlank(responseBody)) {
                    log.warn("AI{}降级：响应体为空，单次耗时={}ms，总耗时={}ms",
                        getOperationLabel(operation), elapsedMs(attemptStartNanos), elapsedMs(totalStartNanos));
                    return new ChatCompletionResult(null, attempt, elapsedMs(attemptStartNanos), elapsedMs(totalStartNanos));
                }

                String content = extractMessageContent(responseBody, operation);
                if (StrUtil.isBlank(content)) {
                    log.warn("AI{}降级：内容为空，单次耗时={}ms，总耗时={}ms",
                        getOperationLabel(operation), elapsedMs(attemptStartNanos), elapsedMs(totalStartNanos));
                    return new ChatCompletionResult(null, attempt, elapsedMs(attemptStartNanos), elapsedMs(totalStartNanos));
                }
                return new ChatCompletionResult(content, attempt, elapsedMs(attemptStartNanos), elapsedMs(totalStartNanos));
            } catch (Exception e) {
                log.warn("AI{}请求第{}/{}次失败: {}，单次耗时={}ms，总耗时={}ms",
                    getOperationLabel(operation), attempt, attempts, safeMessage(e),
                    elapsedMs(attemptStartNanos), elapsedMs(totalStartNanos));
                if (attempt < attempts) {
                    ThreadUtil.safeSleep(retryBackoffMs * attempt);
                    continue;
                }
                return new ChatCompletionResult(null, attempt, elapsedMs(attemptStartNanos), elapsedMs(totalStartNanos));
            }
        }
        return new ChatCompletionResult(null, attempts, elapsedMs(totalStartNanos), elapsedMs(totalStartNanos));
    }

    private String extractMessageContent(String responseBody, String operation) {
        try {
            JSONObject jsonObj = JSONUtil.parseObj(responseBody);
            JSONArray choices = jsonObj.getJSONArray("choices");
            if (choices == null || choices.isEmpty()) {
                log.warn("AI{}降级：响应中缺少choices字段", getOperationLabel(operation));
                return null;
            }
            JSONObject message = choices.getJSONObject(0).getJSONObject("message");
            if (message == null) {
                log.warn("AI{}降级：第一个choice中缺少message字段", getOperationLabel(operation));
                return null;
            }
            return message.getStr("content");
        } catch (Exception e) {
            log.warn("AI{}降级：响应解析失败: {}", getOperationLabel(operation), safeMessage(e));
            return null;
        }
    }

    private String getOperationLabel(String operation) {
        return switch (operation) {
            case "generateMatchReason" -> "生成匹配结果";
            case "calculateMatch" -> "计算人岗匹配分数";
            case "parseResume" -> "解析简历";
            case "parseJob" -> "解析职位";
            case "classifyIndustryFirstPass" -> "一级行业筛选";
            case "classifyIndustrySecondPass" -> "二级行业筛选";
            case "categorizeSkillsByProfile" -> "子行业技能分类";
            case "generateIndustryProfile" -> "子行业分类配置生成";
            default -> "处理请求";
        };
    }

    private String cleanJsonContent(String content) {
        String trimmed = StrUtil.trim(content);
        if (StrUtil.startWith(trimmed, "```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?\\s*", "");
            trimmed = trimmed.replaceFirst("\\s*```$", "");
        }
        return StrUtil.trim(trimmed);
    }

    private String summarize(String text) {
        if (StrUtil.isBlank(text)) {
            return "<empty>";
        }
        return StrUtil.maxLength(text.replace("`r", " ").replace("`n", " "), 160);
    }

    private String safeMessage(Exception e) {
        return StrUtil.blankToDefault(e.getMessage(), e.getClass().getSimpleName());
    }

    private long elapsedMs(long startNanos) {
        return (System.nanoTime() - startNanos) / 1_000_000;
    }

    private record ChatCompletionResult(String content, int attemptCount, long lastAttemptCostMs, long totalCostMs) {
    }

    // =====================================================
    // 【第五部分】行业与技能分类
    // =====================================================

    public Map<String, Object> classifyIndustryFirstPass(
        java.util.List<String> skills,
        java.util.List<Map<String, Object>> parentIndustries
    ) {
        if (!isAiAvailable("classifyIndustryFirstPass")) {
            return Map.of("parentIndustryIds", java.util.Collections.emptyList(), "reason", "AI不可用");
        }
        String content = invokeChatCompletion(
            "classifyIndustryFirstPass",
            industryFirstPassSystemPrompt,
            String.format(
                industryFirstPassUserPrompt,
                JSONUtil.toJsonStr(skills == null ? java.util.Collections.emptyList() : skills),
                JSONUtil.toJsonStr(parentIndustries == null ? java.util.Collections.emptyList() : parentIndustries)
            )
        );
        return parseGenericJsonObject(content, Map.of("parentIndustryIds", java.util.Collections.emptyList(), "reason", "解析失败"));
    }

    public Map<String, Object> classifyIndustrySecondPass(
        java.util.List<String> skills,
        java.util.List<Map<String, Object>> childIndustries
    ) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("industryId", null);
        fallback.put("industryName", null);
        fallback.put("confidence", 0);
        if (!isAiAvailable("classifyIndustrySecondPass")) {
            return fallback;
        }
        String content = invokeChatCompletion(
            "classifyIndustrySecondPass",
            industrySecondPassSystemPrompt,
            String.format(
                industrySecondPassUserPrompt,
                JSONUtil.toJsonStr(skills == null ? java.util.Collections.emptyList() : skills),
                JSONUtil.toJsonStr(childIndustries == null ? java.util.Collections.emptyList() : childIndustries)
            )
        );
        return parseGenericJsonObject(content, fallback);
    }

    public Map<String, Object> categorizeSkillsByProfile(
        java.util.List<String> skills,
        String profileJson
    ) {
        if (!isAiAvailable("categorizeSkillsByProfile")) {
            return Map.of("skillCategories", java.util.Collections.emptyList());
        }
        String content = invokeChatCompletion(
            "categorizeSkillsByProfile",
            industrySkillCategorizeSystemPrompt,
            String.format(
                industrySkillCategorizeUserPrompt,
                JSONUtil.toJsonStr(skills == null ? java.util.Collections.emptyList() : skills),
                StrUtil.blankToDefault(profileJson, "{\"categories\":[]}")
            )
        );
        return parseGenericJsonObject(content, Map.of("skillCategories", java.util.Collections.emptyList()));
    }

    public Map<String, Object> generateIndustryProfile(String parentIndustryName, String childIndustryName) {
        if (!isAiAvailable("generateIndustryProfile")) {
            return Map.of("categories", defaultGeneratedCategories(childIndustryName));
        }
        String content = invokeChatCompletion(
            "generateIndustryProfile",
            industryProfileGenerateSystemPrompt,
            String.format(
                industryProfileGenerateUserPrompt,
                StrUtil.blankToDefault(parentIndustryName, "未知父行业"),
                StrUtil.blankToDefault(childIndustryName, "未知子行业")
            )
        );
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("categories", defaultGeneratedCategories(childIndustryName));
        return parseGenericJsonObject(content, fallback);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseGenericJsonObject(String content, Map<String, Object> fallback) {
        if (StrUtil.isBlank(content)) {
            return fallback;
        }
        try {
            JSONObject jsonObj = JSONUtil.parseObj(cleanJsonContent(content));
            return jsonObj;
        } catch (Exception e) {
            log.warn("行业分类结果解析失败: {}", safeMessage(e));
            return fallback;
        }
    }

    private java.util.List<Map<String, Object>> defaultGeneratedCategories(String childIndustryName) {
        String scope = StrUtil.blankToDefault(childIndustryName, "通用");
        java.util.List<Map<String, Object>> categories = new java.util.ArrayList<>();
        categories.add(Map.of("code", "core_skill", "name", scope + "核心技能"));
        categories.add(Map.of("code", "domain_knowledge", "name", scope + "领域知识"));
        categories.add(Map.of("code", "tooling", "name", scope + "工具能力"));
        categories.add(Map.of("code", "delivery", "name", scope + "交付能力"));
        categories.add(Map.of("code", "collaboration", "name", scope + "协作能力"));
        return categories;
    }
}
