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
 * Service for building skill graphs when resume/job is parsed.
 * Extracts skills from parse results and builds graph relationships in Memgraph.
 */
@Service
public class GraphBuildService {

    private static final Logger log = LoggerFactory.getLogger(GraphBuildService.class);

    @Autowired
    private SkillGraphClient skillGraphClient;

    /**
     * Build skill graph for a resume after parsing.
     * Extracts skills from parseResult JSON and creates person-skill relationships.
     *
     * @param resume the parsed resume
     */
    public void buildGraphForResume(Resume resume) {
        if (resume == null || resume.getParseResult() == null) {
            log.info("Resume or parse result is null, skipping graph build");
            return;
        }

        try {
            List<String> skills = extractSkillsFromParseResult(resume.getParseResult());
            if (skills != null && !skills.isEmpty()) {
                skillGraphClient.buildPersonSkillGraph(resume.getUserId(), skills);
                log.info("Built person-skill graph for user {} with {} skills", resume.getUserId(), skills.size());
            } else {
                log.info("No skills found in parse result for resume {}", resume.getId());
            }
        } catch (Exception e) {
            log.error("Failed to build graph for resume {}: {}", resume.getId(), e.getMessage());
            // Don't fail the parse - just log error
        }
    }

    /**
     * Build skill graph for a job.
     * Extracts skills from job's requiredSkills and preferredSkills fields
     * and creates job-skill relationships.
     *
     * @param job the job entity
     */
    public void buildGraphForJob(Job job) {
        if (job == null) {
            log.info("Job is null, skipping graph build");
            return;
        }

        try {
            List<String> requiredSkills = job.getRequiredSkills();
            List<String> preferredSkills = job.getPreferredSkills();

            if ((requiredSkills == null || requiredSkills.isEmpty()) &&
                (preferredSkills == null || preferredSkills.isEmpty())) {
                log.info("No skills found for job {}", job.getId());
                return;
            }

            skillGraphClient.buildJobSkillGraph(job.getId(), requiredSkills, preferredSkills);
            log.info("Built job-skill graph for job {} with {} required and {} preferred skills",
                    job.getId(),
                    requiredSkills != null ? requiredSkills.size() : 0,
                    preferredSkills != null ? preferredSkills.size() : 0);
        } catch (Exception e) {
            log.error("Failed to build graph for job {}: {}", job.getId(), e.getMessage());
            // Don't fail the parse - just log error
        }
    }

    /**
     * Extract skills list from parse result JSON.
     * Expected format: {"skills": ["Java", "Python", "Spring"]}
     *
     * @param parseResult JSON string from resume parsing
     * @return list of skill names
     */
    private List<String> extractSkillsFromParseResult(String parseResult) {
        List<String> skills = new ArrayList<>();

        if (parseResult == null || parseResult.isEmpty()) {
            return skills;
        }

        try {
            JSONObject json = JSON.parseObject(parseResult);

            // Try to get "skills" array directly
            JSONArray skillsArray = json.getJSONArray("skills");
            if (skillsArray != null) {
                for (int i = 0; i < skillsArray.size(); i++) {
                    skills.add(skillsArray.getString(i));
                }
                return skills;
            }

            // Try nested structure like {"parse_result": {"skills": [...]}}
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

            // Try result.data.skills format
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
            log.error("Failed to parse skills from parse result: {}", e.getMessage());
        }

        return skills;
    }
}