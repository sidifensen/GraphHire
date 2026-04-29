package com.graphhire.skill.infrastructure.graph;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.graphhire.job.domain.model.Company;
import com.graphhire.job.domain.model.Job;
import com.graphhire.job.interfaces.dto.response.CompanyGraphEdgeResponse;
import com.graphhire.job.interfaces.dto.response.CompanyGraphNodeResponse;
import com.graphhire.job.interfaces.dto.response.CompanyGraphResponse;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Config;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.driver.Record;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.Value;
import org.neo4j.driver.Values;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

/**
 * 技能标签图数据库客户端
 * 【模块说明】使用 Memgraph 的 Bolt 协议执行图操作
 */
@Component
public class SkillGraphClient {

    private static final Logger log = LoggerFactory.getLogger(SkillGraphClient.class);
    private static final String NODE_TYPE_COMPANY = "COMPANY";
    private static final String NODE_TYPE_JOB = "JOB";
    private static final String NODE_TYPE_SKILL = "SKILL";
    private static final String EDGE_TYPE_HAS_JOB = "HAS_JOB";
    private static final String EDGE_TYPE_REQUIRES_SKILL = "REQUIRES_SKILL";
    private static final String UPSERT_COMPANY_QUERY = """
        MERGE (c:Company {id: $companyId})
        SET c.name = $companyName
        """;
    private static final String DELETE_STALE_COMPANY_JOB_RELATIONS_QUERY = """
        MATCH (c:Company {id: $companyId})-[r:HAS_JOB]->(j:Job)
        WHERE NOT j.id IN $jobIds
        DELETE r
        """;
    private static final String UPSERT_COMPANY_JOBS_QUERY = """
        MATCH (c:Company {id: $companyId})
        UNWIND $jobs AS job
        MERGE (j:Job {id: job.jobId})
        SET j.title = job.title, j.companyId = $companyId
        MERGE (c)-[:HAS_JOB]->(j)
        WITH j, job
        OPTIONAL MATCH (j)-[old:REQUIRES_SKILL]->(:Skill)
        DELETE old
        WITH j, job
        UNWIND job.skills AS skillName
        MERGE (s:Skill {name: skillName})
        MERGE (j)-[:REQUIRES_SKILL]->(s)
        """;
    private static final String COMPANY_GRAPH_QUERY = """
        MATCH (c:Company {id: $companyId})
        OPTIONAL MATCH (c)-[:HAS_JOB]->(j:Job)
        OPTIONAL MATCH (j)-[:REQUIRES_SKILL]->(s:Skill)
        RETURN c.id AS companyId,
               c.name AS companyName,
               j.id AS jobId,
               j.title AS jobTitle,
               s.name AS skillName
        ORDER BY jobId, skillName
        """;

    @org.springframework.beans.factory.annotation.Value("${memgraph.bolt-url:bolt://localhost:7687}")
    private String boltUrl;

    @org.springframework.beans.factory.annotation.Value("${memgraph.username:}")
    private String username;

    @org.springframework.beans.factory.annotation.Value("${memgraph.password:}")
    private String password;

    @org.springframework.beans.factory.annotation.Value("${memgraph.enabled:true}")
    private boolean enabled;

    private Driver driver;

    @PostConstruct
    public void init() {
        if (!enabled) {
            log.info("Memgraph 集成已被配置禁用");
            driver = null;
            return;
        }
        try {
            Config config = Config.builder()
                .withConnectionTimeout(3, TimeUnit.SECONDS)
                .withMaxConnectionLifetime(30, TimeUnit.MINUTES)
                .withConnectionAcquisitionTimeout(3, TimeUnit.SECONDS)
                .build();

            if (StrUtil.isNotBlank(username)) {
                driver = GraphDatabase.driver(boltUrl, AuthTokens.basic(username, password), config);
            } else {
                driver = GraphDatabase.driver(boltUrl, config);
            }

            try (Session session = driver.session()) {
                session.run("RETURN 1");
                log.info("已成功连接 Memgraph Bolt: {}", boltUrl);
            }
        } catch (Exception e) {
            log.warn("连接 Memgraph 失败: {}，图操作将降级处理", e.getMessage());
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
        if (driver == null || CollUtil.isEmpty(skills)) {
            log.info("跳过个人图谱构建: driverAvailable={}, personId={}, skillCount={}",
                driver != null, personId, CollUtil.size(skills));
            return;
        }

        try (Session session = driver.session()) {
            String cypher = buildPersonSkillCypher(personId, skills);
            session.run(cypher);
            log.info("为人员 {} 构建技能图谱，包含 {} 项技能", personId, skills.size());
        } catch (Exception e) {
            log.error("为人员 {} 构建技能图谱失败: {}", personId, e.getMessage());
        }
    }

    /**
     * 构建职位技能图谱
     */
    public void buildJobSkillGraph(Long jobId, List<String> requiredSkills, List<String> preferredSkills) {
        if (driver == null) {
            log.info("跳过职位图谱构建：驱动不可用");
            return;
        }

        try (Session session = driver.session()) {
            if (CollUtil.isNotEmpty(requiredSkills)) {
                session.run(buildJobSkillCypher(jobId, requiredSkills, EDGE_TYPE_REQUIRES_SKILL));
                log.info("为职位 {} 构建技能图谱，包含 {} 项必填技能", jobId, requiredSkills.size());
            }
            if (CollUtil.isNotEmpty(preferredSkills)) {
                session.run(buildJobSkillCypher(jobId, preferredSkills, "PREFERS_SKILL"));
                log.info("为职位 {} 构建技能图谱，包含 {} 项偏好技能", jobId, preferredSkills.size());
            }
        } catch (Exception e) {
            log.error("为职位 {} 构建技能图谱失败: {}", jobId, e.getMessage());
        }
    }

    /**
     * 同步企业图谱到图数据库
     */
    public void syncCompanyGraph(Company company, List<Job> jobs) {
        if (company == null) {
            log.info("跳过企业图谱同步：企业为空");
            return;
        }
        if (driver == null) {
            log.info("跳过企业图谱同步：驱动不可用，companyId={}", company.getId());
            return;
        }

        List<Job> safeJobs = jobs == null ? List.of() : jobs;
        List<Long> jobIds = safeJobs.stream()
            .map(Job::getId)
            .filter(Objects::nonNull)
            .toList();
        List<Map<String, Object>> jobPayload = safeJobs.stream()
            .filter(job -> job.getId() != null)
            .map(this::toCompanyJobPayload)
            .toList();

        try (Session session = driver.session()) {
            session.writeTransaction(tx -> {
                tx.run(UPSERT_COMPANY_QUERY, Values.parameters(
                    "companyId", company.getId(),
                    "companyName", defaultCompanyName(company)
                ));
                tx.run(DELETE_STALE_COMPANY_JOB_RELATIONS_QUERY, Values.parameters(
                    "companyId", company.getId(),
                    "jobIds", jobIds
                ));
                if (CollUtil.isNotEmpty(jobPayload)) {
                    tx.run(UPSERT_COMPANY_JOBS_QUERY, Values.parameters(
                        "companyId", company.getId(),
                        "jobs", jobPayload
                    ));
                }
                return null;
            });
            log.info("同步企业图谱完成: companyId={}, jobCount={}", company.getId(), safeJobs.size());
        } catch (Exception e) {
            log.warn("同步企业图谱失败: companyId={}, error={}", company.getId(), e.getMessage());
        }
    }

    /**
     * 获取企业图谱
     */
    public CompanyGraphResponse getCompanyGraph(Company company, List<Job> jobs) {
        if (company == null) {
            return new CompanyGraphResponse();
        }
        if (driver == null) {
            log.info("Memgraph 不可用，返回企业图谱降级结果: companyId={}", company.getId());
            return buildFallbackCompanyGraph(company, jobs, false);
        }

        try (Session session = driver.session()) {
            Result result = session.run(COMPANY_GRAPH_QUERY, Values.parameters("companyId", company.getId()));
            CompanyGraphResponse response = createBaseCompanyGraphResponse(company, true);
            LinkedHashMap<String, CompanyGraphNodeResponse> nodes = new LinkedHashMap<>();
            LinkedHashMap<String, CompanyGraphEdgeResponse> edges = new LinkedHashMap<>();

            addNode(nodes, companyNodeId(company.getId()), defaultCompanyName(company), NODE_TYPE_COMPANY);

            while (result.hasNext()) {
                Record record = result.next();
                String companyName = readString(record.get("companyName"));
                if (StrUtil.isNotBlank(companyName)) {
                    response.setCompanyName(companyName);
                    addNode(nodes, companyNodeId(company.getId()), companyName, NODE_TYPE_COMPANY);
                }

                Long jobId = readLong(record.get("jobId"));
                if (jobId == null) {
                    continue;
                }

                String jobTitle = readString(record.get("jobTitle"));
                addNode(nodes, jobNodeId(jobId), StrUtil.blankToDefault(jobTitle, "未命名岗位"), NODE_TYPE_JOB);
                addEdge(edges, companyNodeId(company.getId()), jobNodeId(jobId), EDGE_TYPE_HAS_JOB);

                String skillName = normalizeSkillLabel(readString(record.get("skillName")));
                if (StrUtil.isBlank(skillName)) {
                    continue;
                }

                addNode(nodes, skillNodeId(skillName), skillName, NODE_TYPE_SKILL);
                addEdge(edges, jobNodeId(jobId), skillNodeId(skillName), EDGE_TYPE_REQUIRES_SKILL);
            }

            response.setNodes(new ArrayList<>(nodes.values()));
            response.setEdges(new ArrayList<>(edges.values()));
            return response;
        } catch (Exception e) {
            log.warn("查询企业图谱失败，使用降级结果: companyId={}, error={}", company.getId(), e.getMessage());
            return buildFallbackCompanyGraph(company, jobs, false);
        }
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
                "MATCH (p:Person {id: %d})-[:HAS_SKILL]->(s:Skill) RETURN p.id AS personId, collect(s.name) AS skills",
                personId
            );
            Result result = session.run(cypher);
            if (result.hasNext()) {
                Record record = result.next();
                graphData.put("personId", record.get("personId").asLong());
                graphData.put("skills", record.get("skills").asList(Value::asString));
                graphData.put("success", true);
            }
        } catch (Exception e) {
            log.error("获取人员 {} 技能图谱失败: {}", personId, e.getMessage());
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
                "MATCH (j:Job {id: %d})-[r]->(s:Skill) RETURN j.id AS jobId, collect(s.name) AS skills",
                jobId
            );
            Result result = session.run(cypher);
            if (result.hasNext()) {
                Record record = result.next();
                graphData.put("jobId", record.get("jobId").asLong());
                graphData.put("skills", record.get("skills").asList(Value::asString));
                graphData.put("success", true);
            }
        } catch (Exception e) {
            log.error("获取职位 {} 技能图谱失败: {}", jobId, e.getMessage());
            return getMockJobGraph(jobId);
        }
        return graphData;
    }

    private String buildPersonSkillCypher(Long personId, List<String> skills) {
        StringBuilder sb = new StringBuilder();
        sb.append("MERGE (p:Person {id: ").append(personId).append("})\n");
        for (String skill : skills) {
            String escapedSkill = escapeString(skill);
            int nodeSuffix = skill.hashCode() & 0xFFFF;
            sb.append("MERGE (s").append(nodeSuffix).append(":Skill {name: '").append(escapedSkill).append("'})\n");
            sb.append("MERGE (p)-[:HAS_SKILL]->(s").append(nodeSuffix).append(")\n");
        }
        return sb.toString();
    }

    private String buildJobSkillCypher(Long jobId, List<String> skills, String relationshipType) {
        StringBuilder sb = new StringBuilder();
        sb.append("MERGE (j:Job {id: ").append(jobId).append("})\n");
        for (String skill : skills) {
            String escapedSkill = escapeString(skill);
            int nodeSuffix = skill.hashCode() & 0xFFFF;
            sb.append("MERGE (s").append(nodeSuffix).append(":Skill {name: '").append(escapedSkill).append("'})\n");
            sb.append("MERGE (j)-[:").append(relationshipType).append("]->(s").append(nodeSuffix).append(")\n");
        }
        return sb.toString();
    }

    private String escapeString(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n");
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
        graph.put("jobTitle", "Software Engineer");
        graph.put("skills", List.of("Java", "Spring Boot", "MySQL"));
        graph.put("mock", true);
        return graph;
    }

    private Map<String, Object> toCompanyJobPayload(Job job) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("jobId", job.getId());
        payload.put("title", StrUtil.blankToDefault(job.getTitle(), "未命名岗位"));
        payload.put("skills", normalizeSkills(job.getSkills()));
        return payload;
    }

    private CompanyGraphResponse buildFallbackCompanyGraph(Company company, List<Job> jobs, boolean graphAvailable) {
        CompanyGraphResponse response = createBaseCompanyGraphResponse(company, graphAvailable);
        LinkedHashMap<String, CompanyGraphNodeResponse> nodes = new LinkedHashMap<>();
        LinkedHashMap<String, CompanyGraphEdgeResponse> edges = new LinkedHashMap<>();

        addNode(nodes, companyNodeId(company.getId()), defaultCompanyName(company), NODE_TYPE_COMPANY);

        for (Job job : jobs == null ? List.<Job>of() : jobs) {
            if (job == null || job.getId() == null) {
                continue;
            }
            addNode(nodes, jobNodeId(job.getId()), StrUtil.blankToDefault(job.getTitle(), "未命名岗位"), NODE_TYPE_JOB);
            addEdge(edges, companyNodeId(company.getId()), jobNodeId(job.getId()), EDGE_TYPE_HAS_JOB);

            for (String skill : normalizeSkills(job.getSkills())) {
                addNode(nodes, skillNodeId(skill), skill, NODE_TYPE_SKILL);
                addEdge(edges, jobNodeId(job.getId()), skillNodeId(skill), EDGE_TYPE_REQUIRES_SKILL);
            }
        }

        response.setNodes(new ArrayList<>(nodes.values()));
        response.setEdges(new ArrayList<>(edges.values()));
        return response;
    }

    private CompanyGraphResponse createBaseCompanyGraphResponse(Company company, boolean graphAvailable) {
        CompanyGraphResponse response = new CompanyGraphResponse();
        response.setCompanyId(company.getId());
        response.setCompanyName(defaultCompanyName(company));
        response.setGraphAvailable(graphAvailable);
        return response;
    }

    private void addNode(Map<String, CompanyGraphNodeResponse> nodes, String id, String label, String type) {
        nodes.putIfAbsent(id, new CompanyGraphNodeResponse(id, label, type));
    }

    private void addEdge(Map<String, CompanyGraphEdgeResponse> edges, String source, String target, String type) {
        String edgeKey = source + "|" + type + "|" + target;
        edges.putIfAbsent(edgeKey, new CompanyGraphEdgeResponse(source, target, type));
    }

    private List<String> normalizeSkills(List<String> skills) {
        if (CollUtil.isEmpty(skills)) {
            return List.of();
        }
        LinkedHashMap<String, String> deduplicated = new LinkedHashMap<>();
        for (String skill : skills) {
            String normalized = normalizeSkillLabel(skill);
            if (StrUtil.isBlank(normalized)) {
                continue;
            }
            deduplicated.putIfAbsent(normalized.toLowerCase(Locale.ROOT), normalized);
        }
        return new ArrayList<>(deduplicated.values());
    }

    private String normalizeSkillLabel(String skill) {
        return StrUtil.trimToNull(skill);
    }

    private String defaultCompanyName(Company company) {
        return StrUtil.blankToDefault(company.getName(), "未命名企业");
    }

    private String companyNodeId(Long companyId) {
        return "company:" + companyId;
    }

    private String jobNodeId(Long jobId) {
        return "job:" + jobId;
    }

    private String skillNodeId(String skillName) {
        return "skill:" + skillName.toLowerCase(Locale.ROOT);
    }

    private Long readLong(Value value) {
        if (value == null || value.isNull()) {
            return null;
        }
        return value.asLong();
    }

    private String readString(Value value) {
        if (value == null || value.isNull()) {
            return null;
        }
        return value.asString();
    }
}
