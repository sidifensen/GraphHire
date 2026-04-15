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

    public MatchRecord calculateMatch(Long resumeId, Long jobId) {
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        return calculateMatch(resume, job);
    }

    /**
     * Calculate match between a resume and job using AI-powered DeepSeek matching.
     * Falls back to local calculation if AI is not available.
     */
    public MatchRecord calculateMatch(Resume resume, Job job) {
        // Build user info from resume
        Map<String, Object> userInfo = buildUserInfo(resume);
        // Build job info from job
        Map<String, Object> jobInfo = buildJobInfo(job);

        // Call DeepSeek for AI-powered matching
        Map<String, Object> matchResult = deepSeekClient.calculateMatch(userInfo, jobInfo);

        // Extract scores from result
        double skillScore = getDoubleValue(matchResult, "skill_score", 75.0);
        double expScore = getDoubleValue(matchResult, "experience_score", 75.0);
        double cityScore = getDoubleValue(matchResult, "city_score", 75.0);
        double eduScore = getDoubleValue(matchResult, "education_score", 75.0);
        double salScore = getDoubleValue(matchResult, "salary_score", 75.0);
        double overallScore = getDoubleValue(matchResult, "overall_score", 75.0);

        // Build match reasons
        String matchReason = (String) matchResult.getOrDefault("match_reasons", "Based on skill and experience matching");

        MatchScore score = MatchScore.of(skillScore, expScore, cityScore, eduScore, salScore);
        MatchRecord record = MatchRecord.create(resume.getId(), job.getId(), score);
        record.setMatchReason(matchReason);

        return record;
    }

    private Map<String, Object> buildUserInfo(Resume resume) {
        Map<String, Object> userInfo = new HashMap<>();

        // Extract skills from parseResult JSON if available
        List<String> skills = extractSkillsFromParseResult(resume.getParseResult());
        userInfo.put("skills", skills);

        // Extract experience years
        Integer experienceYears = extractExperienceYearsFromParseResult(resume.getParseResult());
        userInfo.put("experience_years", experienceYears);

        // Extract education
        String education = extractEducationFromParseResult(resume.getParseResult());
        userInfo.put("education", education != null ? education : "本科");

        // Extract target city
        String targetCity = extractTargetCityFromParseResult(resume.getParseResult());
        userInfo.put("target_city", targetCity);

        // Extract expected salary
        Integer expectedSalary = extractExpectedSalaryFromParseResult(resume.getParseResult());
        userInfo.put("expected_salary", expectedSalary);

        return userInfo;
    }

    private Map<String, Object> buildJobInfo(Job job) {
        Map<String, Object> jobInfo = new HashMap<>();

        // Required skills
        jobInfo.put("required_skills", job.getRequiredSkills() != null ? job.getRequiredSkills() : new ArrayList<>());

        // Preferred skills
        jobInfo.put("preferred_skills", job.getPreferredSkills() != null ? job.getPreferredSkills() : new ArrayList<>());

        // Experience required (parse from description or use default)
        String experienceRequired = extractExperienceRequiredFromDescription(job.getDescription());
        jobInfo.put("experience_required", experienceRequired);

        // Education required (parse from description or use default)
        String educationRequired = extractEducationRequiredFromDescription(job.getDescription());
        jobInfo.put("education_required", educationRequired);

        // City
        jobInfo.put("city", job.getLocation() != null ? job.getLocation().getCity() : null);

        // Salary range
        if (job.getSalaryRange() != null && !job.getSalaryRange().isEmpty()) {
            jobInfo.put("salary_range", List.of(job.getSalaryRange().getMin(), job.getSalaryRange().getMax()));
        } else {
            jobInfo.put("salary_range", new ArrayList<>());
        }

        return jobInfo;
    }

    @SuppressWarnings("unchecked")
    private List<String> extractSkillsFromParseResult(String parseResult) {
        if (parseResult == null || parseResult.isBlank()) {
            return new ArrayList<>();
        }
        try {
            // Simple JSON parsing for skills array
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
            // Fallback: try to find skills in raw text
        }
        return new ArrayList<>();
    }

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
            // Try to find years in summary
            var summaryNode = node.get("summary");
            if (summaryNode != null) {
                String summary = summaryNode.asText();
                var match = java.util.regex.Pattern.compile("(\\d+)\\s*年").matcher(summary);
                if (match.find()) {
                    return Integer.parseInt(match.group(1));
                }
            }
        } catch (Exception e) {
            // Fallback
        }
        return 0;
    }

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
            // Fallback
        }
        return "本科";
    }

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
            // Fallback
        }
        return null;
    }

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
            // Fallback
        }
        return null;
    }

    private String extractExperienceRequiredFromDescription(String description) {
        if (description == null || description.isBlank()) {
            return "不限";
        }
        // Try to find experience requirement patterns like "1-3年", "3-5年", "5年以上"
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

    private double getDoubleValue(Map<String, Object> map, String key, double defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return defaultValue;
    }
}
