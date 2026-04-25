package com.graphhire.resume.application.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.graphhire.job.domain.model.Job;
import com.graphhire.resume.domain.model.Resume;
import com.graphhire.skill.infrastructure.graph.SkillGraphClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 技能图谱构建服务
 *
 * 【模块说明】从简历/职位的解析结果中提取技能信息，构建Memgraph知识图谱关系。
 * 【数据来源】Resume.parseResult（JSON格式）
 * 【依赖服务】SkillGraphClient（Memgraph图数据库客户端）
 *
 * 【方法概览】
 * - buildGraphForResume()：为简历构建技能图谱
 * - buildGraphForJob()：为职位构建技能图谱
 * - extractSkillsFromParseResult()：从JSON中提取技能列表（私有）
 */
@Service
public class GraphBuildService {

    /** 日志记录器 */
    private static final Logger log = LoggerFactory.getLogger(GraphBuildService.class);

    /** 技能图谱客户端（Memgraph） */
    @Autowired
    private SkillGraphClient skillGraphClient;

    /**
     * 为简历构建技能图谱
     * 【功能说明】从简历解析结果中提取技能，构建候选人-技能关系。
     * @param resume 已解析的简历实体
     */
    public void buildGraphForResume(Resume resume) {
        if (resume == null || resume.getParseResult() == null) {
            log.info("简历或解析结果为空，跳过图谱构建");
            return;
        }

        try {
            // 从解析结果提取技能列表
            List<String> skills = extractSkillsFromParseResult(resume.getParseResult());
            if (skills != null && !skills.isEmpty()) {
                // 构建图谱关系
                skillGraphClient.buildPersonSkillGraph(resume.getUserId(), skills);
                log.info("为用户{}构建人员技能图谱，包含{}项技能", resume.getUserId(), skills.size());
            } else {
                log.info("简历{}解析结果中未找到技能", resume.getId());
            }
        } catch (Exception e) {
            log.error("简历{}图谱构建失败: {}", resume.getId(), e.getMessage());
            // 不导致解析失败，仅记录错误
        }
    }

    /**
     * 为职位构建技能图谱
     * 【功能说明】从职位的必技能和偏好技能构建职位-技能关系。
     * @param job 职位实体
     */
    public void buildGraphForJob(Job job) {
        if (job == null) {
            log.info("职位为空，跳过图谱构建");
            return;
        }

        try {
            List<String> requiredSkills = job.getRequiredSkills();
            List<String> preferredSkills = job.getPreferredSkills();

            if ((requiredSkills == null || requiredSkills.isEmpty()) &&
                (preferredSkills == null || preferredSkills.isEmpty())) {
                log.info("职位{}未找到技能", job.getId());
                return;
            }

            // 构建图谱关系
            skillGraphClient.buildJobSkillGraph(job.getId(), requiredSkills, preferredSkills);
            log.info("为职位{}构建技能图谱，包含{}项必填技能和{}项偏好技能",
                    job.getId(),
                    requiredSkills != null ? requiredSkills.size() : 0,
                    preferredSkills != null ? preferredSkills.size() : 0);
        } catch (Exception e) {
            log.error("职位{}图谱构建失败: {}", job.getId(), e.getMessage());
            // 不导致解析失败，仅记录错误
        }
    }

    /**
     * 从解析结果JSON中提取技能列表
     * 支持多种JSON格式：
     * - {"skills": ["Java", "Python"]}
     * - {"parse_result": {"skills": [...]}}
     * - {"data": {"skills": [...]}}
     * @param parseResult JSON格式的解析结果
     * @return 技能名称列表
     */
    private List<String> extractSkillsFromParseResult(String parseResult) {
        List<String> skills = new ArrayList<>();

        if (parseResult == null || parseResult.isEmpty()) {
            return skills;
        }

        try {
            JSONObject json = JSON.parseObject(parseResult);

            // 尝试获取 "skills" 数组
            JSONArray skillsArray = json.getJSONArray("skills");
            if (skillsArray != null) {
                for (int i = 0; i < skillsArray.size(); i++) {
                    skills.add(skillsArray.getString(i));
                }
                return skills;
            }

            // 尝试嵌套结构 {"parse_result": {"skills": [...]}}
            JSONObject parseResultObj = json.getJSONObject("parse_result");
            if (parseResultObj != null) {
                skillsArray = parseResultObj.getJSONArray("skills");
                if (skillsArray != null) {
                    for (int i = 0; i < skillsArray.size(); i++) {
                        skills.add(skillsArray.getString(i));
                    }
                    return skills;
                }
            }

            // 尝试 {"data": {"skills": [...]}} 格式
            JSONObject dataObj = json.getJSONObject("data");
            if (dataObj != null) {
                skillsArray = dataObj.getJSONArray("skills");
                if (skillsArray != null) {
                    for (int i = 0; i < skillsArray.size(); i++) {
                        skills.add(skillsArray.getString(i));
                    }
                }
            }

        } catch (Exception e) {
            log.error("从解析结果中提取技能失败: {}", e.getMessage());
        }

        return skills;
    }
}
