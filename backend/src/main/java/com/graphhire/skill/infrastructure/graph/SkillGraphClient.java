package com.graphhire.skill.infrastructure.graph;

import org.neo4j.driver.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.neo4j.driver.Config;

import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * 技能标签图数据库客户端
 * 【模块说明】使用Memgraph的Bolt协议执行图操作
 */
@Component
public class SkillGraphClient {

    private static final Logger log = LoggerFactory.getLogger(SkillGraphClient.class);

    @Value("${memgraph.bolt-url:bolt://localhost:7687}")
    private String boltUrl;

    @Value("${memgraph.username:}")
    private String username;

    @Value("${memgraph.password:}")
    private String password;

    @Value("${memgraph.enabled:true}")
    private boolean enabled;

    private Driver driver;

    @PostConstruct
    public void init() {
        if (!enabled) {
            log.info("Memgraph integration disabled by config.");
            driver = null;
            return;
        }
        try {
            Config config = Config.builder()
                .withConnectionTimeout(3, TimeUnit.SECONDS)
                .withMaxConnectionLifetime(30, TimeUnit.MINUTES)
                .withConnectionAcquisitionTimeout(3, TimeUnit.SECONDS)
                .build();

            if (username != null && !username.isBlank()) {
                driver = GraphDatabase.driver(boltUrl,
                    AuthTokens.basic(username, password), config);
            } else {
                driver = GraphDatabase.driver(boltUrl, config);
            }
            // 测试连接
            try (Session session = driver.session()) {
                session.run("RETURN 1");
                log.info("Connected to Memgraph via Bolt: {}", boltUrl);
            }
        } catch (Exception e) {
            log.warn("Failed to connect to Memgraph: {}. Graph operations will be skipped.", e.getMessage());
            driver = null;
        }
    }

    @PreDestroy
    public void close() {
        if (driver != null) {
            driver.close();
        }
    }

    /**
     * 构建个人技能图谱
     */
    public void buildPersonSkillGraph(Long personId, List<String> skills) {
        if (driver == null || skills == null || skills.isEmpty()) {
            log.info("Skipping graph build: driver unavailable or no skills");
            return;
        }

        try (Session session = driver.session()) {
            String cypher = buildPersonSkillCypher(personId, skills);
            session.run(cypher);
            log.info("Built person-skill graph for person {} with {} skills", personId, skills.size());
        } catch (Exception e) {
            log.error("Failed to build person-skill graph for person {}: {}", personId, e.getMessage());
        }
    }

    /**
     * 构建职位技能图谱
     */
    public void buildJobSkillGraph(Long jobId, List<String> requiredSkills, List<String> preferredSkills) {
        if (driver == null) {
            log.info("Skipping job graph build: driver unavailable");
            return;
        }

        try (Session session = driver.session()) {
            if (requiredSkills != null && !requiredSkills.isEmpty()) {
                session.run(buildJobSkillCypher(jobId, requiredSkills, "REQUIRES_SKILL"));
                log.info("Built job-skill graph for job {} with {} required skills", jobId, requiredSkills.size());
            }
            if (preferredSkills != null && !preferredSkills.isEmpty()) {
                session.run(buildJobSkillCypher(jobId, preferredSkills, "PREFERS_SKILL"));
                log.info("Built job-skill graph for job {} with {} preferred skills", jobId, preferredSkills.size());
            }
        } catch (Exception e) {
            log.error("Failed to build job-skill graph for job {}: {}", jobId, e.getMessage());
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

    /**
     * 获取个人技能图谱数据
     */
    public Map<String, Object> getPersonSkillGraph(Long personId) {
        Map<String, Object> graphData = new HashMap<>();
        if (driver == null) {
            return getMockPersonGraph(personId);
        }

        try (Session session = driver.session()) {
            String cypher = String.format(
                "MATCH (p:Person {id: %d})-[:HAS_SKILL]->(s:Skill) " +
                "RETURN p.id AS personId, collect(s.name) AS skills",
                personId);
            Result result = session.run(cypher);
            if (result.hasNext()) {
                org.neo4j.driver.Record record = result.next();
                graphData.put("personId", record.get("personId").asLong());
                List<String> skills = record.get("skills").asList(v -> v.asString());
                graphData.put("skills", skills);
                graphData.put("success", true);
            }
        } catch (Exception e) {
            log.error("Failed to get person skill graph for person {}: {}", personId, e.getMessage());
            return getMockPersonGraph(personId);
        }
        return graphData;
    }

    /**
     * 获取职位技能图谱数据
     */
    public Map<String, Object> getJobSkillGraph(Long jobId) {
        Map<String, Object> graphData = new HashMap<>();
        if (driver == null) {
            return getMockJobGraph(jobId);
        }

        try (Session session = driver.session()) {
            String cypher = String.format(
                "MATCH (j:Job {id: %d})-[r]->(s:Skill) " +
                "RETURN j.id AS jobId, collect(s.name) AS skills",
                jobId);
            Result result = session.run(cypher);
            if (result.hasNext()) {
                org.neo4j.driver.Record record = result.next();
                graphData.put("jobId", record.get("jobId").asLong());
                List<String> skills = record.get("skills").asList(v -> v.asString());
                graphData.put("skills", skills);
                graphData.put("success", true);
            }
        } catch (Exception e) {
            log.error("Failed to get job skill graph for job {}: {}", jobId, e.getMessage());
            return getMockJobGraph(jobId);
        }
        return graphData;
    }

    private Map<String, Object> getMockPersonGraph(Long personId) {
        Map<String, Object> graph = new HashMap<>();
        graph.put("personId", personId);
        graph.put("skills", List.of("Java", "Spring Boot", "MySQL", "React"));
        graph.put("mock", true);
        return graph;
    }

    private Map<String, Object> getMockJobGraph(Long jobId) {
        Map<String, Object> graph = new HashMap<>();
        graph.put("jobId", jobId);
        graph.put("skills", List.of("Java", "Spring Boot", "MySQL"));
        graph.put("mock", true);
        return graph;
    }
}
