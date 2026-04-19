package com.graphhire.match.domain.service;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.domain.model.JobSkill;
import com.graphhire.job.domain.repository.JobRepository;
import com.graphhire.job.domain.repository.JobSkillRepository;
import com.graphhire.match.interfaces.vo.GraphMatchVO;
import com.graphhire.skill.domain.model.SkillTag;
import com.graphhire.skill.domain.repository.SkillTagRepository;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 技能图谱匹配服务实现
 *
 * 【模块说明】基于Memgraph技能图谱和数据库技能要求，计算人岗技能匹配分数。
 *
 * 【匹配逻辑】
 * 步骤1：从Memgraph获取用户技能图谱
 * 步骤2：从数据库获取职位技能要求（Job.requiredSkills + JobSkill关联表）
 * 步骤3：计算matchedSkills和missingSkills
 * 步骤4：计算匹配率和总分
 * 步骤5：确定匹配等级并生成原因说明
 */
@Service
public class MatchGraphServiceImpl implements MatchGraphService {

    private static final Logger log = LoggerFactory.getLogger(MatchGraphServiceImpl.class);

    /** 匹配等级阈值 */
    private static final double HIGH_THRESHOLD = 80.0;
    private static final double MEDIUM_THRESHOLD = 50.0;

    @Autowired
    private SkillGraphClient skillGraphClient;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobSkillRepository jobSkillRepository;

    @Autowired
    private SkillTagRepository skillTagRepository;

    @Override
    public GraphMatchVO calculateGraphMatchScore(Long personId, Long jobId) {
        // 步骤1：校验参数
        if (personId == null || personId <= 0) {
            throw new IllegalArgumentException("用户ID无效");
        }
        if (jobId == null || jobId <= 0) {
            throw new IllegalArgumentException("职位ID无效");
        }

        // 步骤2：从Memgraph获取用户技能图谱
        Map<String, Object> personGraph = skillGraphClient.getPersonSkillGraph(personId);
        Set<String> personSkills = extractSkillsFromGraph(personGraph);

        // 步骤3：从数据库获取职位技能要求
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new IllegalArgumentException("职位不存在: " + jobId));
        Set<String> requiredSkills = collectJobRequiredSkills(job);

        // 步骤4：计算matchedSkills和missingSkills
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String requiredSkill : requiredSkills) {
            if (personSkills.contains(requiredSkill)) {
                matchedSkills.add(requiredSkill);
            } else {
                missingSkills.add(requiredSkill);
            }
        }

        // 步骤5：计算匹配率
        double matchRate = calculateMatchRate(matchedSkills, missingSkills);
        double totalScore = matchRate;

        // 步骤6：确定匹配等级
        String matchLevel = determineMatchLevel(totalScore);

        // 步骤7：生成匹配原因说明
        String reason = generateMatchReason(matchedSkills, missingSkills, totalScore);

        return new GraphMatchVO(
            personId,
            jobId,
            totalScore,
            matchLevel,
            matchedSkills,
            missingSkills,
            matchRate,
            reason
        );
    }

    /**
     * 从图数据中提取技能列表
     * @param personGraph 图数据
     * @return 技能名称集合
     */
    @SuppressWarnings("unchecked")
    private Set<String> extractSkillsFromGraph(Map<String, Object> personGraph) {
        Set<String> skills = new HashSet<>();

        if (personGraph == null || personGraph.isEmpty()) {
            return skills;
        }

        try {
            // 尝试从skills字段提取
            Object skillsObj = personGraph.get("skills");
            if (skillsObj instanceof List) {
                List<?> skillsList = (List<?>) skillsObj;
                for (Object item : skillsList) {
                    if (item instanceof Map) {
                        Map<?, ?> skillMap = (Map<?, ?>) item;
                        Object skillName = skillMap.get("skill");
                        if (skillName != null) {
                            skills.add(skillName.toString().trim());
                        }
                    }
                }
            }

            // 如果是mock数据，尝试从data字段提取
            if (skills.isEmpty()) {
                Object dataObj = personGraph.get("data");
                if (dataObj instanceof Map) {
                    Map<?, ?> dataMap = (Map<?, ?>) dataObj;
                    Object dataSkills = dataMap.get("skills");
                    if (dataSkills instanceof List) {
                        List<?> dataSkillsList = (List<?>) dataSkills;
                        for (Object item : dataSkillsList) {
                            if (item instanceof Map) {
                                Map<?, ?> skillMap = (Map<?, ?>) item;
                                Object skillName = skillMap.get("skill");
                                if (skillName != null) {
                                    skills.add(skillName.toString().trim());
                                }
                            }
                        }
                    }
                }
            }

            // 尝试解析JSON格式的数据
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
                                        skills.add(skillName.trim());
                                    }
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.debug("解析图数据JSON失败: {}", e.getMessage());
                    }
                }
            }

            // 兼容mock数据格式
            if (skills.isEmpty() && Boolean.TRUE.equals(personGraph.get("mock"))) {
                Object skillsObj2 = personGraph.get("skills");
                if (skillsObj2 instanceof List) {
                    List<?> mockSkills = (List<?>) skillsObj2;
                    for (Object item : mockSkills) {
                        if (item instanceof Map) {
                            Map<?, ?> skillMap = (Map<?, ?>) item;
                            Object skillName = skillMap.get("skill");
                            if (skillName != null) {
                                skills.add(skillName.toString().trim());
                            }
                        }
                    }
                }
            }

        } catch (Exception e) {
            log.warn("提取用户技能图谱异常: {}", e.getMessage());
        }

        log.debug("从图谱提取用户技能: personId对应的技能数量={}", skills.size());
        return skills;
    }

    /**
     * 收集职位的必填技能
     * @param job 职位
     * @return 必填技能名称集合
     */
    private Set<String> collectJobRequiredSkills(Job job) {
        Set<String> requiredSkills = new HashSet<>();

        // 1. 从Job.requiredSkills字段获取
        List<String> jobRequiredSkills = job.getRequiredSkills();
        if (CollUtil.isNotEmpty(jobRequiredSkills)) {
            requiredSkills.addAll(jobRequiredSkills.stream()
                .filter(StrUtil::isNotBlank)
                .map(String::trim)
                .collect(Collectors.toSet()));
        }

        // 2. 从JobSkill关联表获取必填技能（isRequired=true）
        List<JobSkill> jobSkills = jobSkillRepository.findByJobId(job.getId());
        if (CollUtil.isNotEmpty(jobSkills)) {
            for (JobSkill jobSkill : jobSkills) {
                if (Boolean.TRUE.equals(jobSkill.getIsRequired())) {
                    // 通过skillTagId获取技能名称
                    skillTagRepository.findById(jobSkill.getSkillTagId())
                        .ifPresent(skillTag -> requiredSkills.add(skillTag.getName().trim()));
                }
            }
        }

        return requiredSkills;
    }

    /**
     * 计算技能匹配率
     * @param matchedSkills 匹配的技能列表
     * @param missingSkills 缺失的技能列表
     * @return 匹配率百分比 (0-100)
     */
    private double calculateMatchRate(List<String> matchedSkills, List<String> missingSkills) {
        int matchedSize = matchedSkills.size();
        int missingSize = missingSkills.size();
        int total = matchedSize + missingSize;

        if (total == 0) {
            return 0.0;
        }

        return Math.round((double) matchedSize / total * 10000.0) / 100.0;
    }

    /**
     * 根据总分确定匹配等级
     * @param totalScore 总分
     * @return 匹配等级字符串
     */
    private String determineMatchLevel(double totalScore) {
        if (totalScore >= HIGH_THRESHOLD) {
            return "HIGH";
        } else if (totalScore >= MEDIUM_THRESHOLD) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }

    /**
     * 生成匹配原因说明
     * @param matchedSkills 匹配的技能列表
     * @param missingSkills 缺失的技能列表
     * @param totalScore 总分
     * @return 匹配原因说明
     */
    private String generateMatchReason(List<String> matchedSkills, List<String> missingSkills, double totalScore) {
        StringBuilder reason = new StringBuilder();

        if (matchedSkills.isEmpty()) {
            reason.append("用户技能与职位要求不匹配");
        } else if (missingSkills.isEmpty()) {
            reason.append("用户完全满足职位技能要求");
        } else {
            reason.append("用户匹配了").append(matchedSkills.size()).append("项技能，缺失").append(missingSkills.size()).append("项技能");
        }

        // 添加匹配度描述
        if (totalScore >= HIGH_THRESHOLD) {
            reason.append("，匹配度极高");
        } else if (totalScore >= MEDIUM_THRESHOLD) {
            reason.append("，匹配度中等");
        } else {
            reason.append("，建议提升相关技能");
        }

        // 添加具体技能信息
        if (CollUtil.isNotEmpty(matchedSkills)) {
            String topSkills = matchedSkills.stream().limit(3).collect(Collectors.joining("、"));
            reason.append("。核心匹配技能：").append(topSkills);
            if (matchedSkills.size() > 3) {
                reason.append("等");
            }
        }

        if (CollUtil.isNotEmpty(missingSkills)) {
            String missing = missingSkills.stream().limit(3).collect(Collectors.joining("、"));
            reason.append("。建议提升：").append(missing);
            if (missingSkills.size() > 3) {
                reason.append("等");
            }
        }

        return reason.toString();
    }
}
