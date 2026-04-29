# 企业图谱后端优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为企业工作台补齐公司->岗位->技能图谱接口，并顺带优化图数据库访问、抽取重复服务逻辑、补全关键测试与日志。

**Architecture:** 新增 `CompanyGraphAppService` 作为企业图谱编排层，从关系库读取企业和职位数据，同步到 `SkillGraphClient` 管理的 Memgraph，再返回类型化 DTO。现有 `CompanyAppService`、`JobAppService` 抽取统一读取/保存逻辑，并通过单测和 IT 覆盖控制层、服务层和图客户端降级行为。

**Tech Stack:** Spring Boot 3.4、Java 21、MyBatis-Plus、Sa-Token、Neo4j Java Driver(Memgraph)、JUnit 5、Mockito、MockMvc、Hutool

---

### Task 1: 先写企业图谱与服务重构失败测试

**Files:**
- Create: `backend/src/test/java/com/graphhire/job/application/service/CompanyGraphAppServiceTest.java`
- Create: `backend/src/test/java/com/graphhire/job/application/service/CompanyAppServiceTest.java`
- Create: `backend/src/test/java/com/graphhire/job/application/service/JobAppServiceTest.java`
- Modify: `backend/src/test/java/com/graphhire/skill/infrastructure/graph/SkillGraphClientTest.java`
- Modify: `backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java`
- Modify: `backend/src/test/java/com/graphhire/controllerIT/MatchGraphControllerIT.java`

- [ ] **Step 1: 写企业图谱服务和控制器失败测试**

```java
@Test
void getCompanyGraph_ShouldReturnCompanyJobSkillStructure() {
    Company company = new Company();
    company.setId(1L);
    company.setName("GraphHire");

    Job job = new Job();
    job.setId(11L);
    job.setCompanyId(1L);
    job.setTitle("Java工程师");
    job.setSkills(List.of("Java", "Spring Boot"));

    when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
    when(jobRepository.findByCompanyId(1L)).thenReturn(List.of(job));

    CompanyGraphResponse response = companyGraphAppService.getCompanyGraph(1L);

    assertEquals(1L, response.getCompanyId());
    assertTrue(response.getNodes().stream().anyMatch(node -> "COMPANY".equals(node.getType())));
    assertTrue(response.getEdges().stream().anyMatch(edge -> "HAS_JOB".equals(edge.getType())));
}
```

- [ ] **Step 2: 运行测试，确认新能力当前失败**

Run: `mvn -Dtest=CompanyGraphAppServiceTest,CompanyAppServiceTest,JobAppServiceTest,SkillGraphClientTest,CompanyControllerIT,MatchGraphControllerIT test`
Expected: FAIL，提示企业图谱服务/DTO/接口不存在或断言不满足

- [ ] **Step 3: 补图客户端降级和去重测试**

```java
@Test
void getCompanyGraphFallback_ShouldDeduplicateSkills() {
    SkillGraphClient client = new SkillGraphClient();

    Company company = new Company();
    company.setId(1L);
    company.setName("GraphHire");

    Job first = new Job();
    first.setId(10L);
    first.setTitle("后端工程师");
    first.setSkills(List.of("Java", "Spring Boot"));

    Job second = new Job();
    second.setId(11L);
    second.setTitle("平台工程师");
    second.setSkills(List.of("Java", "Docker"));

    CompanyGraphResponse response = client.buildCompanyGraphFallback(company, List.of(first, second));

    long javaNodeCount = response.getNodes().stream()
        .filter(node -> "SKILL".equals(node.getType()) && "Java".equals(node.getLabel()))
        .count();
    assertEquals(1, javaNodeCount);
}
```

- [ ] **Step 4: 补 IT 断言而不是只看 code**

```java
mockMvc.perform(get("/company/graph").headers(companyHeaders))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.code").value(200))
    .andExpect(jsonPath("$.data.companyId").isNumber())
    .andExpect(jsonPath("$.data.nodes").isArray())
    .andExpect(jsonPath("$.data.edges").isArray());
```

- [ ] **Step 5: 提交测试基线文档与代码前状态检查**

Run: `git diff -- backend/src/test/java`
Expected: 只出现测试新增和增强，没有生产代码变更

### Task 2: 实现企业图谱 DTO、服务与图客户端

**Files:**
- Create: `backend/src/main/java/com/graphhire/job/application/service/CompanyGraphAppService.java`
- Create: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyGraphResponse.java`
- Create: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyGraphNodeResponse.java`
- Create: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyGraphEdgeResponse.java`
- Modify: `backend/src/main/java/com/graphhire/skill/infrastructure/graph/SkillGraphClient.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`

- [ ] **Step 1: 为企业图谱定义类型化响应对象**

```java
public class CompanyGraphResponse {
    private Long companyId;
    private String companyName;
    private boolean graphAvailable;
    private List<CompanyGraphNodeResponse> nodes;
    private List<CompanyGraphEdgeResponse> edges;
}
```

- [ ] **Step 2: 实现企业图谱应用服务**

```java
public CompanyGraphResponse getCompanyGraph(Long requestedCompanyId, Long currentCompanyId) {
    Long targetCompanyId = requestedCompanyId == null ? currentCompanyId : requestedCompanyId;
    if (!targetCompanyId.equals(currentCompanyId)) {
        throw new Exceptions.ForbiddenException("无权访问其他企业图谱");
    }
    Company company = requireCompany(targetCompanyId);
    List<Job> jobs = jobRepository.findByCompanyId(targetCompanyId);
    skillGraphClient.syncCompanyGraph(company, jobs);
    return skillGraphClient.getCompanyGraph(company, jobs);
}
```

- [ ] **Step 3: 将 `SkillGraphClient` 改为参数化 Cypher + 降级构图**

```java
String cypher = """
    MERGE (c:Company {id: $companyId})
    SET c.name = $companyName
""";
session.run(cypher, Values.parameters("companyId", company.getId(), "companyName", company.getName()));
```

- [ ] **Step 4: 在企业控制器暴露图谱接口**

```java
@GetMapping("/graph")
public Result<CompanyGraphResponse> getCompanyGraph(@RequestParam(required = false) Long companyId) {
    Long currentCompanyId = currentCompanyId();
    return Result.success(companyGraphAppService.getCompanyGraph(companyId, currentCompanyId));
}
```

- [ ] **Step 5: 运行新增测试，确认由红转绿**

Run: `mvn -Dtest=CompanyGraphAppServiceTest,SkillGraphClientTest,CompanyControllerIT test`
Expected: PASS

### Task 3: 抽取公司/职位服务重复逻辑并补日志

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/application/service/CompanyAppService.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/service/JobAppService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/GraphBuildService.java`

- [ ] **Step 1: 为公司服务提取统一读取与保存入口**

```java
private Company requireCompany(Long companyId) {
    return companyRepository.findById(companyId)
        .orElseThrow(() -> new IllegalArgumentException("企业不存在"));
}
```

- [ ] **Step 2: 为职位服务提取统一读取与保存入口**

```java
private Job requireJob(Long jobId) {
    return jobRepository.findById(jobId)
        .orElseThrow(() -> new IllegalArgumentException("职位不存在"));
}
```

- [ ] **Step 3: 在关键方法增加 `log.info`**

```java
log.info("创建职位: companyId={}, title={}, skillCount={}", companyId, title, CollUtil.size(skills));
log.info("查询企业图谱: companyId={}, requestedCompanyId={}", currentCompanyId, requestedCompanyId);
```

- [ ] **Step 4: 跑服务层测试验证重构未改坏行为**

Run: `mvn -Dtest=CompanyAppServiceTest,JobAppServiceTest,GraphBuildServiceTest test`
Expected: PASS

### Task 4: 完整验证与交付准备

**Files:**
- Modify: `docs/superpowers/specs/2026-04-29-233854-company-graph-backend-optimization-design.md`
- Modify: `docs/superpowers/acceptance/2026-04-29-233854-company-graph-backend-optimization-acceptance.md`
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 运行后端编译**

Run: `mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 2: 运行后端测试**

Run: `mvn test`
Expected: BUILD SUCCESS，0 个失败

- [ ] **Step 3: 运行仓库要求的前端编译和测试**

Run: `npm run build`
Expected: 前端构建成功

Run: `npm run test:run`
Expected: 前端测试成功

- [ ] **Step 4: 用 CDP 做企业图谱接口浏览器验证**

Run: 使用 `web-access` / CDP 打开企业工作台，确认企业相关页面与图谱接口请求成功返回
Expected: 浏览器请求成功，无 4xx/5xx，响应含企业/岗位/技能图结构

- [ ] **Step 5: 更新发布说明并提交**

```bash
git add docs/superpowers/specs/2026-04-29-233854-company-graph-backend-optimization-design.md \
        docs/superpowers/acceptance/2026-04-29-233854-company-graph-backend-optimization-acceptance.md \
        docs/superpowers/plans/2026-04-29-233854-company-graph-backend-optimization.md \
        backend RELEASE-NOTES.md
git commit -m "feat: 新增企业图谱接口并优化后端图谱服务"
```
