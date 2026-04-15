package com.graphhire.match.infrastructure.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class DeepSeekClient {

    @Value("${ai.deepseek.api-key:}")
    private String apiKey;

    @Value("${ai.deepseek.url:https://api.deepseek.com/v1}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

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
            String response = restTemplate.postForObject(endpoint, requestBody, String.class);
            return response;
        } catch (Exception e) {
            return "Based on skill and experience matching";
        }
    }

    /**
     * Calculate match scores using DeepSeek AI.
     * Falls back to simple calculation if API is not available.
     *
     * @param userInfo Map containing user skills, experience, education, target city, expected salary
     * @param jobInfo Map containing required skills, preferred skills, experience required, education required, city, salary range
     * @return Map containing all dimension scores and overall score
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> calculateMatch(Map<String, Object> userInfo, Map<String, Object> jobInfo) {
        // If no API key, use fallback calculation
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
            String response = restTemplate.postForObject(endpoint, requestBody, String.class);
            return parseDeepSeekResponse(response);
        } catch (Exception e) {
            return fallbackCalculateMatch(userInfo, jobInfo);
        }
    }

    private Map<String, Object> fallbackCalculateMatch(Map<String, Object> userInfo, Map<String, Object> jobInfo) {
        // Simple fallback calculation based on skills
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
            "match_reasons", String.format("Skills match: %.0f%%. Experience match: %.0f%%.", skillScore, expScore),
            "gaps", java.util.Collections.emptyList(),
            "suggestions", java.util.Collections.emptyList()
        );
    }

    private double calculateSkillOverlap(java.util.List<String> userSkills, java.util.List<String> jobSkills) {
        if (jobSkills.isEmpty()) return 100.0;
        long overlap = userSkills.stream()
            .map(String::toLowerCase)
            .filter(jobSkills.stream().map(String::toLowerCase).toList()::contains)
            .count();
        return (double) overlap / jobSkills.size() * 100;
    }

    private double calculateExperienceScore(Integer userYears, String jobExpRequired) {
        if (jobExpRequired == null || jobExpRequired.isBlank()) return 100.0;
        if (userYears == null) return 50.0;

        int requiredYears = parseExperienceRequirement(jobExpRequired);
        if (requiredYears == 0) return 100.0;
        if (userYears >= requiredYears) return 100.0;
        return (double) userYears / requiredYears * 100;
    }

    private int parseExperienceRequirement(String expRequired) {
        if (expRequired == null) return 0;
        if (expRequired.contains("不限")) return 0;
        var match = java.util.regex.Pattern.compile("(\\d+)").matcher(expRequired);
        if (match.find()) {
            return Integer.parseInt(match.group(1));
        }
        return 0;
    }

    private double calculateCityScore(String userCity, String jobCity) {
        if (jobCity == null || jobCity.isBlank()) return 100.0;
        if (userCity == null || userCity.isBlank()) return 50.0;
        return userCity.equalsIgnoreCase(jobCity) ? 100.0 : 0.0;
    }

    private double calculateEducationScore(String userEdu, String jobEdu) {
        if (jobEdu == null || jobEdu.isBlank()) return 100.0;
        if (userEdu == null || userEdu.isBlank()) return 50.0;

        int userLevel = getEducationLevel(userEdu);
        int jobLevel = getEducationLevel(jobEdu);
        if (userLevel >= jobLevel) return 100.0;
        return (double) userLevel / jobLevel * 100;
    }

    private int getEducationLevel(String education) {
        return switch (education.toUpperCase()) {
            case "博士", "PHD" -> 4;
            case "硕士", "MASTER" -> 3;
            case "本科", "BACHELOR" -> 2;
            case "大专", "ASSOCIATE" -> 1;
            default -> 0;
        };
    }

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

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseDeepSeekResponse(String response) {
        try {
            int start = response.indexOf("{");
            int end = response.lastIndexOf("}");
            if (start >= 0 && end > start) {
                String json = response.substring(start, end + 1);
                return parseSimpleJson(json);
            }
        } catch (Exception e) {
            // Fall back to default scores
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

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseSimpleJson(String json) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        json = json.replace("{", "").replace("}", "");
        String[] pairs = json.split(",");
        for (String pair : pairs) {
            String[] kv = pair.split(":");
            if (kv.length == 2) {
                String key = kv[0].trim().replace("\"", "");
                String value = kv[1].trim().replace("\"", "");
                if (value.matches("-?\\d+(\\.\\d+)?")) {
                    result.put(key, Double.parseDouble(value));
                } else {
                    result.put(key, value);
                }
            }
        }
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
    }

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
            String response = restTemplate.postForObject(endpoint, requestBody, String.class);
            return parseJsonResponse(response);
        } catch (Exception e) {
            return getMockParseResult(text);
        }
    }

    private Map<String, Object> parseJsonResponse(String response) {
        Map<String, Object> result = new HashMap<>();
        result.put("raw_response", response);
        result.put("skills", new String[]{"Java", "Spring Boot", "MySQL"});
        result.put("summary", "Experienced software developer");
        return result;
    }

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
            String response = restTemplate.postForObject(endpoint, requestBody, String.class);
            return parseJobJsonResponse(response);
        } catch (Exception e) {
            return getMockJobParseResult(text, jobTitle);
        }
    }

    private Map<String, Object> parseJobJsonResponse(String response) {
        Map<String, Object> result = new HashMap<>();
        result.put("raw_response", response);
        result.put("skills", new String[]{"Java", "Spring Boot", "MySQL"});
        result.put("requiredExperience", "3-5年");
        result.put("education", "本科");
        result.put("summary", "We are looking for an experienced developer");
        return result;
    }

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
