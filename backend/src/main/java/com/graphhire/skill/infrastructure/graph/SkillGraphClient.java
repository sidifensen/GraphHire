package com.graphhire.skill.infrastructure.graph;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * 技能标签图数据库客户端
 * 【模块说明】使用Memgraph的HTTP API（默认端口30002）执行图操作
 */
@Component
public class SkillGraphClient {

    private static final Logger log = LoggerFactory.getLogger(SkillGraphClient.class);

    // Memgraph HTTP API地址，可通过配置文件修改
    private static final String MEMGRAPH_URL = "http://localhost:30002";

    private final RestTemplate restTemplate;

    public SkillGraphClient() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * 构建个人技能图谱
     * 【功能说明】在Memgraph中创建技能节点和(person)-[:HAS_SKILL]->(skill)关系
     * @param personId 人员ID
     * @param skills 技能名称列表
     */
    public void buildPersonSkillGraph(Long personId, List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            log.info("No skills to build graph for person {}", personId);
            return;
        }

        try {
            // 使用Cypher查询创建技能节点和人员-技能关系
            String cypher = buildPersonSkillCypher(personId, skills);
            executeCypher(cypher);
            log.info("Built person-skill graph for person {} with {} skills", personId, skills.size());
        } catch (Exception e) {
            log.error("Failed to build person-skill graph for person {}: {}", personId, e.getMessage());
            // 不导致解析失败，仅记录错误
        }
    }

    /**
     * 构建职位技能图谱
     * 【功能说明】在Memgraph中创建技能节点和职位技能关系（REQUIRES_SKILL和PREFERS_SKILL）
     * @param jobId 职位ID
     * @param requiredSkills 必填技能列表
     * @param preferredSkills 优先技能列表
     */
    public void buildJobSkillGraph(Long jobId, List<String> requiredSkills, List<String> preferredSkills) {
        try {
            // 构建必填技能关系
            if (requiredSkills != null && !requiredSkills.isEmpty()) {
                String requiredCypher = buildJobSkillCypher(jobId, requiredSkills, "REQUIRES_SKILL");
                executeCypher(requiredCypher);
                log.info("Built job-skill graph for job {} with {} required skills", jobId, requiredSkills.size());
            }

            // 构建优先技能关系
            if (preferredSkills != null && !preferredSkills.isEmpty()) {
                String preferredCypher = buildJobSkillCypher(jobId, preferredSkills, "PREFERS_SKILL");
                executeCypher(preferredCypher);
                log.info("Built job-skill graph for job {} with {} preferred skills", jobId, preferredSkills.size());
            }
        } catch (Exception e) {
            log.error("Failed to build job-skill graph for job {}: {}", jobId, e.getMessage());
            // 不导致解析失败，仅记录错误
        }
    }

    /**
     * 获取个人技能图谱数据
     * @param personId 人员ID
     * @return 包含节点和关系的图数据
     */
    public Map<String, Object> getPersonSkillGraph(Long personId) {
        try {
            String cypher = String.format(
                "MATCH (p:Person {id: %d})-[:HAS_SKILL]->(s:Skill) " +
                "OPTIONAL MATCH (s)-[:RELATED_TO]->(related:Skill) " +
                "RETURN p.id AS personId, collect(DISTINCT {skill: s.name, " +
                "proficiency: properties((p)-[:HAS_SKILL]->(s)).proficiency, " +
                "relatedSkills: collect(DISTINCT related.name)}) AS skills",
                personId);

            JSONObject result = executeCypherQuery(cypher);
            return parseGraphResult(result);
        } catch (Exception e) {
            log.error("Failed to get person skill graph for person {}: {}", personId, e.getMessage());
            return getMockPersonGraph(personId);
        }
    }

    /**
     * 获取职位技能图谱数据
     * @param jobId 职位ID
     * @return 包含节点和关系的图数据
     */
    public Map<String, Object> getJobSkillGraph(Long jobId) {
        try {
            String cypher = String.format(
                "MATCH (j:Job {id: %d})-[r]->(s:Skill) " +
                "RETURN j.id AS jobId, j.title AS jobTitle, " +
                "collect(DISTINCT {skill: s.name, relationshipType: type(r), " +
                "weight: properties(r).weight}) AS skills",
                jobId);

            JSONObject result = executeCypherQuery(cypher);
            return parseGraphResult(result);
        } catch (Exception e) {
            log.error("Failed to get job skill graph for job {}: {}", jobId, e.getMessage());
            return getMockJobGraph(jobId);
        }
    }

    private String buildPersonSkillCypher(Long personId, List<String> skills) {
        StringBuilder sb = new StringBuilder();
        sb.append("MERGE (p:Person {id: ").append(personId).append("})\n");

        for (String skill : skills) {
            String escapedSkill = escapeString(skill);
            sb.append("MERGE (s").append(skill.hashCode() & 0xFFFF).append(":Skill {name: '").append(escapedSkill).append("'})\n");
            sb.append("MERGE (p)-[:HAS_SKILL]->(s").append(skill.hashCode() & 0xFFFF).append(")\n");
        }

        return sb.toString();
    }

    private String buildJobSkillCypher(Long jobId, List<String> skills, String relationshipType) {
        StringBuilder sb = new StringBuilder();
        sb.append("MERGE (j:Job {id: ").append(jobId).append("})\n");

        for (String skill : skills) {
            String escapedSkill = escapeString(skill);
            sb.append("MERGE (s").append(skill.hashCode() & 0xFFFF).append(":Skill {name: '").append(escapedSkill).append("'})\n");
            sb.append("MERGE (j)-[:").append(relationshipType).append("]->(s").append(skill.hashCode() & 0xFFFF).append(")\n");
        }

        return sb.toString();
    }

    private String escapeString(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n");
    }

    private void executeCypher(String cypher) {
        try {
            String url = MEMGRAPH_URL + "/db/data/transaction/commit";

            JSONObject requestBody = new JSONObject();
            JSONArray statements = new JSONArray();
            JSONObject statement = new JSONObject();
            statement.put("statement", cypher);
            statements.add(statement);
            requestBody.put("statements", statements);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
            restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        } catch (Exception e) {
            log.warn("Memgraph not available, graph operations skipped: {}", e.getMessage());
            throw new RuntimeException("Memgraph not available", e);
        }
    }

    private JSONObject executeCypherQuery(String cypher) {
        try {
            String url = MEMGRAPH_URL + "/db/data/transaction/commit";

            JSONObject requestBody = new JSONObject();
            JSONArray statements = new JSONArray();
            JSONObject statement = new JSONObject();
            statement.put("statement", cypher);
            statements.add(statement);
            requestBody.put("statements", statements);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
            String response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class).getBody();

            return JSON.parseObject(response);
        } catch (Exception e) {
            log.warn("Memgraph not available, returning mock data: {}", e.getMessage());
            return new JSONObject();
        }
    }

    private Map<String, Object> parseGraphResult(JSONObject result) {
        Map<String, Object> graphData = new HashMap<>();

        if (result == null || result.isEmpty()) {
            return graphData;
        }

        try {
            JSONArray results = result.getJSONArray("results");
            if (results != null && !results.isEmpty()) {
                graphData.put("data", results.get(0));
            }
            graphData.put("success", true);
        } catch (Exception e) {
            graphData.put("success", false);
            graphData.put("error", e.getMessage());
        }

        return graphData;
    }

    /**
     * 获取模拟个人图谱数据（无Memgraph时测试用）
     */
    private Map<String, Object> getMockPersonGraph(Long personId) {
        Map<String, Object> graph = new HashMap<>();
        graph.put("personId", personId);
        graph.put("skills", List.of(
            Map.of("skill", "Java", "proficiency", "advanced", "relatedSkills", List.of("Spring", "Microservices")),
            Map.of("skill", "Python", "proficiency", "intermediate", "relatedSkills", List.of("Django", "Data Science"))
        ));
        graph.put("mock", true);
        return graph;
    }

    /**
     * 获取模拟职位图谱数据（无Memgraph时测试用）
     */
    private Map<String, Object> getMockJobGraph(Long jobId) {
        Map<String, Object> graph = new HashMap<>();
        graph.put("jobId", jobId);
        graph.put("jobTitle", "Software Engineer");
        graph.put("skills", List.of(
            Map.of("skill", "Java", "relationshipType", "REQUIRES_SKILL", "weight", 0.9),
            Map.of("skill", "Spring", "relationshipType", "PREFERS_SKILL", "weight", 0.7)
        ));
        graph.put("mock", true);
        return graph;
    }
}