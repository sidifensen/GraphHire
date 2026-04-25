package com.graphhire.match.domain.service;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.match.domain.model.MatchRecord;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.match.domain.vo.RequirementScoreDetail;
import com.graphhire.match.infrastructure.ai.DeepSeekClient;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MatchDomainService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CityMatchScorer cityMatchScorer;

    @Autowired
    private SalaryMatchScorer salaryMatchScorer;

    @Autowired
    private EducationMatchScorer educationMatchScorer;

    @Autowired
    private DeepSeekClient deepSeekClient;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public MatchRecord calculateMatch(Long resumeId, Long jobId) {
        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        return calculateMatch(resume, job);
    }

    public MatchRecord calculateMatch(Resume resume, Job job) {
        Profile profile = extractProfile(resume);

        double skillScore = calculateSkillScore(profile.skills, safeSkills(job.getRequiredSkills()));
        double cityScore = cityMatchScorer.score(profile.targetCity, job.getLocation() == null ? null : job.getLocation().getCity());
        double salaryScore = salaryMatchScorer.score(profile.expectedSalary, job.getSalaryRange() == null ? null : job.getSalaryRange().getMin(), job.getSalaryRange() == null ? null : job.getSalaryRange().getMax());
        double educationScore = educationMatchScorer.score(profile.education, extractEducationRequiredFromDescription(job.getDescription()));

        RequirementScoreDetail detail = RequirementScoreDetail.of(cityScore, salaryScore, educationScore);
        MatchScore score = MatchScore.of(skillScore, detail);

        MatchRecord record = MatchRecord.create(resume.getId(), job.getId(), score);
        record.setMatchReason(generateReason(resume.getId(), job.getId(), skillScore, score.getRequirementScore()));
        record.setMatchDirection(MatchRecord.DIRECTION_PERSON_APPLIES);
        return record;
    }

    private String generateReason(Long resumeId, Long jobId, double skillScore, double requirementScore) {
        String aiReason = deepSeekClient.generateMatchReason(resumeId, jobId);
        if (StrUtil.isNotBlank(aiReason) && !"Based on skill and experience matching".equalsIgnoreCase(aiReason.trim())) {
            return aiReason;
        }
        return StrUtil.format("技能匹配度{}%，岗位要求匹配度{}%。", Math.round(skillScore), Math.round(requirementScore));
    }

    private double calculateSkillScore(List<String> userSkills, List<String> requiredSkills) {
        if (CollUtil.isEmpty(requiredSkills)) {
            return 0.0;
        }
        Set<String> user = normalizeSkills(userSkills);
        Set<String> required = normalizeSkills(requiredSkills);
        if (required.isEmpty()) {
            return 0.0;
        }
        long matched = required.stream().filter(user::contains).count();
        return Math.round((matched * 10000.0) / required.size()) / 100.0;
    }

    private Set<String> normalizeSkills(List<String> skills) {
        Set<String> result = new HashSet<>();
        if (skills == null) {
            return result;
        }
        for (String skill : skills) {
            if (StrUtil.isBlank(skill)) {
                continue;
            }
            result.add(skill.trim().toLowerCase(Locale.ROOT));
        }
        return result;
    }

    private List<String> safeSkills(List<String> skills) {
        return skills == null ? Collections.emptyList() : skills;
    }

    private Profile extractProfile(Resume resume) {
        if (StrUtil.isBlank(resume.getParseResult())) {
            return new Profile(Collections.emptyList(), null, null, null);
        }
        try {
            JsonNode root = MAPPER.readTree(resume.getParseResult());
            List<String> skills = new ArrayList<>();
            JsonNode skillsNode = root.get("skills");
            if (skillsNode != null && skillsNode.isArray()) {
                for (JsonNode node : skillsNode) {
                    skills.add(node.asText());
                }
            }
            String targetCity = readFirstString(root, "target_city", "expected_location", "city");
            Integer expectedSalary = readInteger(root, "expected_salary");
            String education = extractEducation(root);
            return new Profile(skills, targetCity, expectedSalary, education);
        } catch (Exception ignored) {
            return new Profile(Collections.emptyList(), null, null, null);
        }
    }

    private String extractEducation(JsonNode root) {
        JsonNode educationNode = root.get("education");
        if (educationNode == null || educationNode.isNull()) {
            return null;
        }
        if (educationNode.isArray()) {
            for (JsonNode node : educationNode) {
                JsonNode degree = node.get("degree");
                if (degree != null && !degree.isNull()) {
                    return degree.asText();
                }
            }
            return null;
        }
        return educationNode.asText();
    }

    private Integer readInteger(JsonNode root, String field) {
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isNumber()) {
            return node.asInt();
        }
        String text = node.asText();
        String digits = text.replaceAll("[^0-9]", "");
        if (StrUtil.isBlank(digits)) {
            return null;
        }
        try {
            return Integer.parseInt(digits);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String readFirstString(JsonNode root, String... fields) {
        for (String field : fields) {
            JsonNode node = root.get(field);
            if (node != null && !node.isNull() && StrUtil.isNotBlank(node.asText())) {
                return node.asText();
            }
        }
        return null;
    }

    private String extractEducationRequiredFromDescription(String description) {
        if (StrUtil.isBlank(description)) {
            return "本科";
        }
        if (description.contains("博士")) return "博士";
        if (description.contains("硕士")) return "硕士";
        if (description.contains("本科")) return "本科";
        if (description.contains("大专")) return "大专";
        return "本科";
    }

    private record Profile(List<String> skills, String targetCity, Integer expectedSalary, String education) {
    }
}
