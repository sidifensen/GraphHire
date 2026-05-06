# Industry Skill Profile + AI 行业判定与技能分类（含图数据库落图）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增“子行业技能分类配置表（industry_skill_profile）”并由 AI 生成初始化数据；在个人图谱中接入“两阶段 AI 行业筛选 + 子行业分类”，并把判定结果与技能分类结果写入图数据库（Memgraph）。

**Architecture:** PostgreSQL 负责 `industry_skill_profile` 配置持久化；应用层新增分类编排服务，复用 DeepSeek 两阶段判定并基于 profile 分类技能；图层在 `SkillGraphClient` 增加行业节点/分类节点关系写入与读取，`/person/graph` 返回数据库与图库一致的结构化分类结果。全程 TDD（RED-GREEN-REFACTOR）。

**Tech Stack:** Spring Boot 3.4、MyBatis-Plus、PostgreSQL JSONB、Memgraph(Bolt)、DeepSeek API、JUnit5/Mockito、Next.js 16、Vitest

---

### Task 1: 数据库结构与基线脚本（industry_skill_profile）

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_05_06_025__add_industry_skill_profile_table.sql`
- Modify: `backend/src/main/resources/db/schema.sql`
- Test: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/IndustrySkillProfileSchemaSqlTest.java`

- [ ] **Step 1: 写失败测试（schema 必须包含新表与关键约束）**

```java
@Test
void shouldContainIndustrySkillProfileTableDefinition() throws IOException {
    Path schemaPath = Path.of("src/main/resources/db/schema.sql");
    String schemaSql = Files.readString(schemaPath);

    assertTrue(schemaSql.contains("CREATE TABLE industry_skill_profile"));
    assertTrue(schemaSql.contains("uk_industry_skill_profile_industry"));
    assertTrue(schemaSql.contains("profile_json JSONB"));
}
```

- [ ] **Step 2: 运行后端目标测试确认 RED**

Run: `mvn -Dtest=IndustrySkillProfileSchemaSqlTest test`
Expected: FAIL（尚未定义新表）。

- [ ] **Step 3: 新增迁移脚本（按已确认 SQL）**

```sql
CREATE TABLE IF NOT EXISTS industry_skill_profile
(
    id           BIGSERIAL PRIMARY KEY,
    industry_id  BIGINT    NOT NULL,
    profile_json JSONB     NOT NULL,
    create_time  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted      SMALLINT  NOT NULL DEFAULT 0,

    CONSTRAINT uk_industry_skill_profile_industry UNIQUE (industry_id),
    CONSTRAINT fk_industry_skill_profile_industry
        FOREIGN KEY (industry_id) REFERENCES industry(id),
    CONSTRAINT chk_industry_skill_profile_deleted CHECK (deleted IN (0, 1))
);
```

- [ ] **Step 4: 同步更新 schema.sql 基线定义与注释**

```sql
COMMENT ON COLUMN industry_skill_profile.profile_json IS '技能分类JSON，结构: {"categories":[{"code":"...","name":"..."}]}';
```

- [ ] **Step 5: 运行目标测试确认 GREEN**

Run: `mvn -Dtest=IndustrySkillProfileSchemaSqlTest test`
Expected: PASS。

### Task 2: 后端领域模型与仓储接入（PostgreSQL）

**Files:**
- Create: `backend/src/main/java/com/graphhire/industryskill/domain/model/IndustrySkillProfile.java`
- Create: `backend/src/main/java/com/graphhire/industryskill/domain/repository/IndustrySkillProfileRepository.java`
- Create: `backend/src/main/java/com/graphhire/industryskill/infrastructure/persistence/po/IndustrySkillProfilePO.java`
- Create: `backend/src/main/java/com/graphhire/industryskill/infrastructure/persistence/mapper/IndustrySkillProfileMapper.java`
- Create: `backend/src/main/java/com/graphhire/industryskill/infrastructure/persistence/repository/IndustrySkillProfileRepositoryImpl.java`
- Create: `backend/src/main/java/com/graphhire/industryskill/application/service/IndustrySkillProfileAppService.java`
- Test: `backend/src/test/java/com/graphhire/industryskill/application/service/IndustrySkillProfileAppServiceTest.java`

- [ ] **Step 1: 写失败测试（按二级行业ID读写 profile_json）**
- [ ] **Step 2: 运行目标测试确认 RED**

Run: `mvn -Dtest=IndustrySkillProfileAppServiceTest test`
Expected: FAIL。

- [ ] **Step 3: 实现最小领域对象与仓储接口**

```java
public class IndustrySkillProfile {
    private Long id;
    private Long industryId;
    private String profileJson;
    private Integer deleted;
}
```

- [ ] **Step 4: 实现 MyBatis 映射与 RepositoryImpl（JSONB 文本持久化）**

```java
@Select("SELECT id, industry_id, profile_json::text AS profile_json FROM industry_skill_profile WHERE industry_id = #{industryId} AND deleted = 0")
IndustrySkillProfilePO selectByIndustryId(@Param("industryId") Long industryId);
```

- [ ] **Step 5: 实现应用服务读写接口**

```java
public Optional<IndustrySkillProfile> getByIndustryId(Long industryId);
public IndustrySkillProfile saveOrUpdate(Long industryId, String profileJson);
```

- [ ] **Step 6: 运行目标测试确认 GREEN**

Run: `mvn -Dtest=IndustrySkillProfileAppServiceTest test`
Expected: PASS。

### Task 3: 两阶段 AI 行业判定与技能分类服务（后端）

**Files:**
- Create: `backend/src/main/resources/prompts/industry-first-pass.md`
- Create: `backend/src/main/resources/prompts/industry-second-pass.md`
- Create: `backend/src/main/resources/prompts/industry-skill-categorize.md`
- Create: `backend/src/main/java/com/graphhire/industryskill/application/service/IndustrySkillClassificationService.java`
- Modify: `backend/src/main/java/com/graphhire/match/infrastructure/ai/DeepSeekClient.java`
- Test: `backend/src/test/java/com/graphhire/match/infrastructure/ai/DeepSeekClientTest.java`
- Test: `backend/src/test/java/com/graphhire/industryskill/application/service/IndustrySkillClassificationServiceTest.java`

- [ ] **Step 1: 写失败测试（DeepSeekClient 支持三类新请求）**
- [ ] **Step 2: 运行目标测试确认 RED**

Run: `mvn -Dtest=DeepSeekClientTest,IndustrySkillClassificationServiceTest test`
Expected: FAIL。

- [ ] **Step 3: 在 DeepSeekClient 增加三类方法（复用现有重试/降级）**

```java
public Map<String, Object> classifyIndustryFirstPass(List<String> skills, List<Map<String, Object>> parentIndustries);
public Map<String, Object> classifyIndustrySecondPass(List<String> skills, List<Map<String, Object>> childIndustries);
public Map<String, Object> categorizeSkillsByProfile(List<String> skills, String profileJson);
```

- [ ] **Step 4: 实现编排服务（两段筛选 + 分类）**

```java
// parent pass -> child pass -> load profile -> categorize
```

- [ ] **Step 5: 失败回退返回未匹配结构，不抛异常**
- [ ] **Step 6: 运行目标测试确认 GREEN**

Run: `mvn -Dtest=DeepSeekClientTest,IndustrySkillClassificationServiceTest test`
Expected: PASS。

### Task 4: 图数据库写入行业与分类关系（Memgraph）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/skill/infrastructure/graph/SkillGraphClient.java`
- Test: `backend/src/test/java/com/graphhire/skill/infrastructure/graph/SkillGraphClientTest.java`

- [ ] **Step 1: 写失败测试（新增写入/读取方法签名与返回结构）**

```java
@Test
void upsertPersonIndustryClassification_WhenDriverUnavailable_ShouldNotThrow() {
    SkillGraphClient client = new SkillGraphClient();
    assertDoesNotThrow(() -> client.upsertPersonIndustryClassification(1L, 12L, "计算机软件", List.of()));
}
```

- [ ] **Step 2: 运行目标测试确认 RED**

Run: `mvn -Dtest=SkillGraphClientTest test`
Expected: FAIL。

- [ ] **Step 3: 实现图谱写入方法（清旧关系再写新关系）**

```java
public void upsertPersonIndustryClassification(
    Long personId,
    Long industryId,
    String industryName,
    List<Map<String, Object>> skillCategories
)
```

Cypher 目标关系：
- `(p:Person)-[:BELONGS_TO_INDUSTRY]->(i:Industry {id,name})`
- `(p)-[:HAS_SKILL_CATEGORY]->(c:SkillCategory {personId,code,name})`
- `(c)-[:CONTAINS_SKILL]->(s:Skill)`

- [ ] **Step 4: 实现图谱读取方法（返回行业与分类聚合）**

```java
public Map<String, Object> getPersonIndustryClassification(Long personId)
```

- [ ] **Step 5: 运行目标测试确认 GREEN**

Run: `mvn -Dtest=SkillGraphClientTest test`
Expected: PASS。

### Task 5: AI 生成初始化数据脚本（按子行业ID写入 profile_json）

**Files:**
- Create: `backend/src/main/java/com/graphhire/industryskill/application/service/IndustrySkillProfileBootstrapService.java`
- Create: `backend/src/main/java/com/graphhire/industryskill/interfaces/controller/AdminIndustrySkillProfileController.java`
- Test: `backend/src/test/java/com/graphhire/industryskill/application/service/IndustrySkillProfileBootstrapServiceTest.java`

- [ ] **Step 1: 写失败测试（遍历 level=2 行业生成每条至少5分类并落库）**
- [ ] **Step 2: 运行目标测试确认 RED**

Run: `mvn -Dtest=IndustrySkillProfileBootstrapServiceTest test`
Expected: FAIL。

- [ ] **Step 3: 实现 bootstrap 服务（全量与单行业重建）**

```java
public int bootstrapAllLeafIndustries();
public void bootstrapByIndustryId(Long industryId);
```

- [ ] **Step 4: 增加管理端触发接口（仅管理员）**

```java
@PostMapping("/admin/industry-skill-profile/bootstrap")
public Result<Integer> bootstrapAll();
```

- [ ] **Step 5: 运行目标测试确认 GREEN**

Run: `mvn -Dtest=IndustrySkillProfileBootstrapServiceTest test`
Expected: PASS。

### Task 6: /person/graph 接口扩展并触发图数据库落图

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java`
- Modify: `backend/src/test/java/com/graphhire/resume/interfaces/controller/PersonControllerTest.java`
- Modify: `backend/src/test/java/com/graphhire/resume/interfaces/controller/it/PersonControllerIT.java`

- [ ] **Step 1: 写失败测试（响应包含 industryMatch + skillCategories，并调用落图）**
- [ ] **Step 2: 运行目标测试确认 RED**

Run: `mvn -Dtest=PersonControllerTest,PersonControllerIT test`
Expected: FAIL。

- [ ] **Step 3: 最小实现（先分类，再写图库，再返回）**

```java
Map<String, Object> classify = industrySkillClassificationService.classifyPersonSkills(skills);
skillGraphClient.upsertPersonIndustryClassification(...);
graph.put("industryMatch", classify.get("industryMatch"));
graph.put("skillCategories", classify.get("skillCategories"));
```

- [ ] **Step 4: 运行目标测试确认 GREEN**

Run: `mvn -Dtest=PersonControllerTest,PersonControllerIT test`
Expected: PASS。

### Task 7: 前端图谱页消费分类结果并分组展示

**Files:**
- Modify: `frontend/src/lib/api/person.ts`
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx`
- Modify: `frontend/src/tests/pages/user-skill-graph-page.test.tsx`

- [ ] **Step 1: 写失败测试（分类分组渲染断言）**
- [ ] **Step 2: 运行前端目标测试确认 RED**

Run: `npm run test:run -- src/tests/pages/user-skill-graph-page.test.tsx`
Expected: FAIL。

- [ ] **Step 3: 扩展类型并按分类聚团构图**

```ts
industryMatch?: { industryId?: number; industryName?: string | null; matched?: boolean };
skillCategories?: Array<{ code: string; name: string; skills: string[] }>;
```

- [ ] **Step 4: 运行前端目标测试确认 GREEN**

Run: `npm run test:run -- src/tests/pages/user-skill-graph-page.test.tsx`
Expected: PASS。

### Task 8: 全量验证、发布记录与提交

**Files:**
- Modify: `RELEASE-NOTES.md`
- Modify: `docs/superpowers/plans/2026-05-06-132229-industry-skill-profile-ai-bootstrap.md`

- [ ] **Step 1: 运行后端验证命令**

Run:
```bash
cd backend
mvn compile
mvn test
```
Expected: PASS。

- [ ] **Step 2: 运行前端验证命令**

Run:
```bash
cd frontend
npm run build
npm run test:run
```
Expected: PASS。

- [ ] **Step 3: 更新 RELEASE-NOTES.md**

追加：行业技能分类表、AI 初始化、图数据库行业/分类关系落图、图谱接口扩展、前端分类聚团展示。

- [ ] **Step 4: Git 提交（中文前缀规范）**

```bash
git add backend/src/main/resources/db/migration/V2026_05_06_025__add_industry_skill_profile_table.sql \
        backend/src/main/resources/db/schema.sql \
        backend/src/main/java/com/graphhire/industryskill \
        backend/src/main/java/com/graphhire/match/infrastructure/ai/DeepSeekClient.java \
        backend/src/main/java/com/graphhire/skill/infrastructure/graph/SkillGraphClient.java \
        backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java \
        backend/src/test/java/com/graphhire/industryskill \
        backend/src/test/java/com/graphhire/match/infrastructure/ai/DeepSeekClientTest.java \
        backend/src/test/java/com/graphhire/skill/infrastructure/graph/SkillGraphClientTest.java \
        backend/src/test/java/com/graphhire/resume/interfaces/controller/PersonControllerTest.java \
        backend/src/test/java/com/graphhire/resume/interfaces/controller/it/PersonControllerIT.java \
        frontend/src/lib/api/person.ts \
        frontend/src/app/(user)/skill-graph/page.tsx \
        frontend/src/tests/pages/user-skill-graph-page.test.tsx \
        RELEASE-NOTES.md \
        docs/superpowers/plans/2026-05-06-132229-industry-skill-profile-ai-bootstrap.md

git commit -m "feat: 新增子行业技能分类并落图数据库"
```
