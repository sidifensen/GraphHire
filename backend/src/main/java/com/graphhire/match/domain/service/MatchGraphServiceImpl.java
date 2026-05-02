package com.graphhire.match.domain.service;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.match.domain.vo.MatchScore;
import com.graphhire.match.domain.vo.RequirementScoreDetail;
import com.graphhire.match.interfaces.vo.GraphMatchVO;
import com.graphhire.resume.domain.model.PersonInfo;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.resume.domain.repository.PersonInfoRepository;
import com.graphhire.resume.domain.repository.ResumeRepository;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchGraphServiceImpl implements MatchGraphService {

    private static final Logger log = LoggerFactory.getLogger(MatchGraphServiceImpl.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired
    private SkillGraphClient skillGraphClient;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private PersonInfoRepository personInfoRepository;

    @Autowired
    private CityMatchScorer cityMatchScorer;

    @Autowired
    private SalaryMatchScorer salaryMatchScorer;

    @Autowired
    private EducationMatchScorer educationMatchScorer;

    @Override
    public GraphMatchVO calculateGraphMatchScore(Long personId, Long jobId) {
        if (personId == null || personId <= 0) {
            throw new IllegalArgumentException("用户ID无效");
        }
        if (jobId == null || jobId <= 0) {
            throw new IllegalArgumentException("职位ID无效");
        }

        Map<String, Object> personGraph = skillGraphClient.getPersonSkillGraph(personId);
        Set<String> personSkills = extractSkillsFromGraph(personGraph);

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new IllegalArgumentException("职位不存在: " + jobId));
        Set<String> requiredSkills = collectJobRequiredSkills(job);

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String requiredSkill : requiredSkills) {
            if (personSkills.contains(requiredSkill.toLowerCase(Locale.ROOT))) {
                matchedSkills.add(requiredSkill);
            } else {
                missingSkills.add(requiredSkill);
            }
        }

        double skillScore = calculateSkillScore(matchedSkills, missingSkills);
        Profile profile = resolveProfile(personId);
        double cityScore = cityMatchScorer.score(profile.targetCity, job.getLocation() == null ? null : job.getLocation().getCity());
        double salaryScore = salaryMatchScorer.score(profile.expectedSalary, job.getSalaryRange() == null ? null : job.getSalaryRange().getMin(), job.getSalaryRange() == null ? null : job.getSalaryRange().getMax());
        double educationScore = educationMatchScorer.score(profile.education, extractJobEducationRequired(job));
        RequirementScoreDetail requirementDetail = RequirementScoreDetail.of(cityScore, salaryScore, educationScore);

        MatchScore score = MatchScore.of(skillScore, requirementDetail);
        String matchLevel = determineMatchLevel(score.getTotal());
        String reason = generateMatchReason(matchedSkills, missingSkills, score.getTotal());

        return new GraphMatchVO(
            personId,
            jobId,
            score.getTotal(),
            score.getSkillScore(),
            score.getRequirementScore(),
            score.getCityScore(),
            score.getSalaryScore(),
            score.getEducationScore(),
            matchLevel,
            matchedSkills,
            missingSkills,
            score.getSkillScore(),
            reason
        );
    }

    private Profile resolveProfile(Long userId) {
        Optional<PersonInfo> personInfoOpt = personInfoRepository.findByUserId(userId);
        String personTargetCity = personInfoOpt.map(PersonInfo::getTargetCity).orElse(null);
        Integer personExpectedSalary = personInfoOpt.map(PersonInfo::getExpectedSalary).orElse(null);
        String personEducation = personInfoOpt.map(PersonInfo::getEducation).orElse(null);
        boolean personProfileReady = StrUtil.isNotBlank(personTargetCity) || personExpectedSalary != null || StrUtil.isNotBlank(personEducation);
        if (personProfileReady) {
            return new Profile(personTargetCity, personExpectedSalary, personEducation);
        }

        List<Resume> resumes = resumeRepository.findByUserId(userId);
        if (CollUtil.isEmpty(resumes)) {
            return new Profile(null, null, null);
        }
        Resume preferred = resumes.stream().filter(r -> Boolean.TRUE.equals(r.getIsDefault())).findFirst().orElse(resumes.get(0));
        if (StrUtil.isBlank(preferred.getParseResult())) {
            return new Profile(null, null, null);
        }
        try {
            JsonNode root = MAPPER.readTree(preferred.getParseResult());
            String targetCity = readFirstString(root, "target_city", "expected_location", "city");
            Integer expectedSalary = readInteger(root, "expected_salary");
            String education = extractEducation(root);
            return new Profile(targetCity, expectedSalary, education);
        } catch (Exception e) {
            return new Profile(null, null, null);
        }
    }

    private String extractJobEducationRequired(Job job) {
        if (job == null) {
            return "3";
        }
        if (job.getEducation() != null) {
            return String.valueOf(job.getEducation());
        }
        return extractEducationRequiredFromDescription(job.getDescription());
    }

    @SuppressWarnings("unchecked")
    private Set<String> extractSkillsFromGraph(Map<String, Object> personGraph) {
        Set<String> skills = new HashSet<>();
        if (personGraph == null || personGraph.isEmpty()) {
            return skills;
        }

        try {
            Object skillsObj = personGraph.get("skills");
            if (skillsObj instanceof List) {
                List<?> skillsList = (List<?>) skillsObj;
                for (Object item : skillsList) {
                    if (item instanceof String) {
                        String skillName = ((String) item).trim();
                        if (StrUtil.isNotBlank(skillName)) {
                            skills.add(skillName.toLowerCase(Locale.ROOT));
                        }
                    } else if (item instanceof Map) {
                        Map<?, ?> skillMap = (Map<?, ?>) item;
                        Object skillName = skillMap.get("skill");
                        if (skillName != null) {
                            skills.add(skillName.toString().trim().toLowerCase(Locale.ROOT));
                        }
                    }
                }
            }

            if (skills.isEmpty()) {
                Object dataObj = personGraph.get("data");
                if (dataObj instanceof Map) {
                    Map<?, ?> dataMap = (Map<?, ?>) dataObj;
                    Object dataSkills = dataMap.get("skills");
                    if (dataSkills instanceof List) {
                        List<?> dataSkillsList = (List<?>) dataSkills;
                        for (Object item : dataSkillsList) {
                            if (item instanceof String) {
                                String skillName = ((String) item).trim();
                                if (StrUtil.isNotBlank(skillName)) {
                                    skills.add(skillName.toLowerCase(Locale.ROOT));
                                }
                            } else if (item instanceof Map) {
                                Map<?, ?> skillMap = (Map<?, ?>) item;
                                Object skillName = skillMap.get("skill");
                                if (skillName != null) {
                                    skills.add(skillName.toString().trim().toLowerCase(Locale.ROOT));
                                }
                            }
                        }
                    }
                }
            }

            if (skills.isEmpty()) {
                String dataStr = String.valueOf(personGraph.get("data"));
                if (StrUtil.isNotBlank(dataStr) && !dataStr.equals("null")) {
                    try {
                        JSONObject jsonData = JSONObject.parseObject(dataStr);
                        if (jsonData != null) {
                            JSONArray jsonSkills = jsonData.getJSONArray("skills");
                            if (jsonSkills != null) {
                                for (int i = 0; i < jsonSkills.size(); i++) {
                                    JSONObject skillObj = jsonSkills.getJSONObject(i);
                                    String skillName = skillObj.getString("skill");
                                    if (StrUtil.isNotBlank(skillName)) {
                                        skills.add(skillName.trim().toLowerCase(Locale.ROOT));
                                    }
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.error("解析图数据JSON失败: {}", e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("提取用户技能图谱异常: {}", e.getMessage());
        }

        return skills;
    }

    private Set<String> collectJobRequiredSkills(Job job) {
        Set<String> requiredSkills = new HashSet<>();
        List<String> jobRequiredSkills = job.getSkills();
        if (CollUtil.isNotEmpty(jobRequiredSkills)) {
            requiredSkills.addAll(jobRequiredSkills.stream()
                .filter(StrUtil::isNotBlank)
                .map(String::trim)
                .collect(Collectors.toSet()));
        }
        return requiredSkills;
    }

    private double calculateSkillScore(List<String> matchedSkills, List<String> missingSkills) {
        int matchedSize = matchedSkills.size();
        int missingSize = missingSkills.size();
        int total = matchedSize + missingSize;
        if (total == 0) {
            return 0.0;
        }
        return Math.round((double) matchedSize / total * 10000.0) / 100.0;
    }

    private String determineMatchLevel(double totalScore) {
        if (totalScore >= 80) {
            return "HIGH";
        } else if (totalScore >= 50) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }

    private String generateMatchReason(List<String> matchedSkills, List<String> missingSkills, double totalScore) {
        StringBuilder reason = new StringBuilder();
        if (matchedSkills.isEmpty()) {
            reason.append("用户技能与职位要求不匹配");
        } else if (missingSkills.isEmpty()) {
            reason.append("用户完全满足职位技能要求");
        } else {
            reason.append("用户匹配了").append(matchedSkills.size()).append("项技能，缺失").append(missingSkills.size()).append("项技能");
        }
        if (totalScore >= 80) {
            reason.append("，综合匹配度极高");
        } else if (totalScore >= 50) {
            reason.append("，综合匹配度中等");
        } else {
            reason.append("，建议补齐岗位相关能力");
        }
        return reason.toString();
    }

    private String extractEducationRequiredFromDescription(String description) {
        if (StrUtil.isBlank(description)) {
            return "3";
        }
        if (description.contains("博士")) return "5";
        if (description.contains("硕士")) return "4";
        if (description.contains("本科")) return "3";
        if (description.contains("大专")) return "2";
        if (description.contains("中专")) return "1";
        return "3";
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
        String digits = node.asText().replaceAll("[^0-9]", "");
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

    private record Profile(String targetCity, Integer expectedSalary, String education) {}
}
