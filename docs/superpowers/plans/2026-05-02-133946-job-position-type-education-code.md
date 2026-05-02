# Job 学历编码与职位类型树实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `job.education` 改为 `smallint` 编码（1 中专、2 大专、3 本科、4 硕士、5 博士），新增 `position_type` 职位类型树表，并在 `job` 增加 `position_type_id` 字段。

**Architecture:** 采用“数据库先行 + 领域模型映射 + 接口兼容”方式：先通过迁移与 schema 同步结构，再更新 Job 领域/持久化对象类型，最后补充职位类型查询接口与用例。保留现有 `job.job_type`（全职/兼职/实习）语义不变，新增 `job.position_type_id` 表示岗位类别。

**Tech Stack:** Spring Boot、MyBatis-Plus、PostgreSQL、Flyway、JUnit5、MockMvc

---

### Task 1: 数据库结构迁移（position_type + job 字段调整）

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_05_02_018__job_education_code_and_position_type.sql`
- Modify: `backend/src/main/resources/db/schema.sql`
- Test: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/JobSchemaSqlTest.java`

- [ ] **Step 1: 写失败测试（schema 约束）**

```java
@Test
void shouldContainPositionTypeTableAndJobEducationCodeConstraint() throws IOException {
    Path schemaPath = Path.of("src/main/resources/db/schema.sql");
    String schemaSql = Files.readString(schemaPath);

    assertTrue(schemaSql.contains("CREATE TABLE position_type"), "必须包含 position_type 表");
    assertTrue(schemaSql.contains("code         BIGINT       NOT NULL UNIQUE"), "position_type.code 必须唯一");
    assertTrue(schemaSql.contains("CONSTRAINT chk_position_type_level CHECK (level IN (1, 2, 3))"), "position_type.level 约束缺失");
    assertTrue(schemaSql.contains("education    SMALLINT"), "job.education 必须为 SMALLINT");
    assertTrue(schemaSql.contains("CONSTRAINT chk_job_education CHECK (education IS NULL OR education IN (1, 2, 3, 4, 5))"), "job.education 编码约束缺失");
    assertTrue(schemaSql.contains("position_type_id BIGINT"), "job.position_type_id 字段缺失");
}
```

- [ ] **Step 2: 运行测试确认失败**

Run: `mvn -Dtest=JobSchemaSqlTest test`
Expected: FAIL，提示缺少 `position_type` 或 `chk_job_education` 等断言。

- [ ] **Step 3: 实现迁移 SQL（含历史数据映射）**

```sql
CREATE TABLE position_type
(
    id          BIGSERIAL PRIMARY KEY,
    code        BIGINT       NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    parent_id   BIGINT,
    level       SMALLINT     NOT NULL,
    sort_no     INT          NOT NULL DEFAULT 0,
    status      SMALLINT     NOT NULL DEFAULT 1,
    create_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted     SMALLINT     NOT NULL DEFAULT 0,
    CONSTRAINT chk_position_type_level CHECK (level IN (1, 2, 3)),
    CONSTRAINT chk_position_type_status CHECK (status IN (0, 1))
);

CREATE INDEX idx_position_type_parent_id ON position_type(parent_id);
CREATE INDEX idx_position_type_level ON position_type(level);

ALTER TABLE job ADD COLUMN IF NOT EXISTS position_type_id BIGINT;
ALTER TABLE job ADD COLUMN IF NOT EXISTS education_code SMALLINT;

UPDATE job
SET education_code = CASE
    WHEN education IN ('中专', '中专/中技') THEN 1
    WHEN education = '大专' THEN 2
    WHEN education = '本科' THEN 3
    WHEN education = '硕士' THEN 4
    WHEN education = '博士' THEN 5
    ELSE NULL
END;

ALTER TABLE job DROP COLUMN education;
ALTER TABLE job RENAME COLUMN education_code TO education;
ALTER TABLE job ADD CONSTRAINT chk_job_education CHECK (education IS NULL OR education IN (1, 2, 3, 4, 5));
CREATE INDEX idx_job_position_type_id ON job(position_type_id);

COMMENT ON COLUMN job.education IS '学历要求编码：1-中专 2-大专 3-本科 4-硕士 5-博士';
COMMENT ON COLUMN job.position_type_id IS '职位类型ID（关联position_type.id，由应用层保证）';
```

- [ ] **Step 4: 更新 schema.sql 到最终状态**

```sql
education        SMALLINT,
position_type_id BIGINT,
...
CONSTRAINT chk_job_education CHECK (education IS NULL OR education IN (1, 2, 3, 4, 5)),
CONSTRAINT chk_job_type CHECK (job_type IN (1, 2, 3)),
```

- [ ] **Step 5: 运行测试确认通过**

Run: `mvn -Dtest=JobSchemaSqlTest test`
Expected: PASS。

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/resources/db/migration/V2026_05_02_018__job_education_code_and_position_type.sql backend/src/main/resources/db/schema.sql backend/src/test/java/com/graphhire/job/infrastructure/persistence/JobSchemaSqlTest.java
git commit -m "feat: 新增职位类型表并将岗位学历改为编码字段"
```

### Task 2: 领域模型与持久化映射更新（Job + PositionType）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/domain/model/Job.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/JobPO.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/command/PublishJobCmd.java`
- Create: `backend/src/main/java/com/graphhire/job/domain/model/PositionType.java`
- Create: `backend/src/main/java/com/graphhire/job/domain/repository/PositionTypeRepository.java`
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/PositionTypePO.java`
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/mapper/PositionTypeMapper.java`
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/PositionTypeRepositoryImpl.java`
- Test: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/repository/JobRepositoryImplTest.java`
- Test: `backend/src/test/java/com/graphhire/job/application/command/PublishJobCmdJsonTest.java`

- [ ] **Step 1: 写失败测试（Job 持久化 education/positionTypeId）**

```java
@Test
@DisplayName("save should persist education code and positionTypeId")
void save_ShouldPersistEducationAndPositionTypeId() {
    Job job = new Job();
    job.setCompanyId(1L);
    job.setTitle("Java开发");
    job.setStatus(JobStatus.DRAFT);
    job.setEducation(3);
    job.setPositionTypeId(100101L);

    doAnswer(invocation -> {
        JobPO po = invocation.getArgument(0);
        po.setId(100L);
        assertEquals(3, po.getEducation());
        assertEquals(100101L, po.getPositionTypeId());
        return 1;
    }).when(jobMapper).insert(any(JobPO.class));

    Job saved = repository.save(job);
    assertEquals(100L, saved.getId());
}
```

- [ ] **Step 2: 运行测试确认失败**

Run: `mvn -Dtest=JobRepositoryImplTest test`
Expected: FAIL，因 `education` 类型仍为 `String` 且无 `positionTypeId` 映射。

- [ ] **Step 3: 最小实现（Job/JobPO/Cmd 字段调整）**

```java
// Job.java
private Integer education;
private Long positionTypeId;

// JobPO.java
@TableField("education")
private Integer education;
@TableField("position_type_id")
private Long positionTypeId;

// PublishJobCmd.java
private Integer education;
private Long positionTypeId;
```

- [ ] **Step 4: 新增 PositionType 持久化链路**

```java
public class PositionType {
    private Long id;
    private Long code;
    private String name;
    private Long parentId;
    private Integer level;
    private Integer sortNo;
    private Integer status;
    private Integer deleted;
}
```

```java
public interface PositionTypeRepository {
    List<PositionType> findEnabledByParentId(Long parentId);
    Optional<PositionType> findById(Long id);
    Optional<PositionType> findByCode(Long code);
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `mvn -Dtest=JobRepositoryImplTest,PublishJobCmdJsonTest test`
Expected: PASS。

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/graphhire/job/domain/model/Job.java backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/JobPO.java backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobRepositoryImpl.java backend/src/main/java/com/graphhire/job/application/command/PublishJobCmd.java backend/src/main/java/com/graphhire/job/domain/model/PositionType.java backend/src/main/java/com/graphhire/job/domain/repository/PositionTypeRepository.java backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/PositionTypePO.java backend/src/main/java/com/graphhire/job/infrastructure/persistence/mapper/PositionTypeMapper.java backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/PositionTypeRepositoryImpl.java backend/src/test/java/com/graphhire/job/infrastructure/persistence/repository/JobRepositoryImplTest.java backend/src/test/java/com/graphhire/job/application/command/PublishJobCmdJsonTest.java
git commit -m "feat: 支持岗位学历编码和职位类型ID领域映射"
```

### Task 3: 应用服务与接口返回对齐（公司端 + 公共端）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/application/service/JobAppService.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyJobListItemResponse.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicJobController.java`
- Modify: `backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicJobCardResponse.java`
- Create: `backend/src/main/java/com/graphhire/job/interfaces/controller/PositionTypeController.java`
- Create: `backend/src/main/java/com/graphhire/job/interfaces/dto/response/PositionTypeTreeNodeResponse.java`
- Test: `backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicJobControllerIT.java`
- Test: `backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java`

- [ ] **Step 1: 写失败测试（公共职位接口返回 educationCode/positionTypeId）**

```java
mockMvc.perform(get("/public/jobs").param("keyword", "PUBLIC_JOB_IT"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.data.records[0].educationCode").value(3))
    .andExpect(jsonPath("$.data.records[0].positionTypeId").value(100101));
```

- [ ] **Step 2: 运行测试确认失败**

Run: `mvn -Dtest=PublicJobControllerIT test`
Expected: FAIL，因响应结构尚无新字段。

- [ ] **Step 3: 最小实现（服务入参校验 + DTO 替换）**

```java
// JobAppService.createJob / updateJobInfo
job.setEducation(cmd.getEducation());
job.setPositionTypeId(cmd.getPositionTypeId());
if (job.getEducation() != null && (job.getEducation() < 1 || job.getEducation() > 5)) {
    throw new IllegalArgumentException("学历编码非法");
}
```

```java
// PublicJobCardResponse
Integer educationCode,
Long positionTypeId,
```

- [ ] **Step 4: 新增职位类型树查询接口（只返回 name/id/code/children）**

```java
@RestController
@RequestMapping("/position-types")
public class PositionTypeController {
    @GetMapping("/tree")
    public Result<List<PositionTypeTreeNodeResponse>> tree() { ... }
}
```

- [ ] **Step 5: 运行接口测试确认通过**

Run: `mvn -Dtest=PublicJobControllerIT,CompanyControllerIT test`
Expected: PASS。

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/graphhire/job/application/service/JobAppService.java backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java backend/src/main/java/com/graphhire/job/interfaces/dto/response/CompanyJobListItemResponse.java backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicJobController.java backend/src/main/java/com/graphhire/publicapi/interfaces/dto/response/PublicJobCardResponse.java backend/src/main/java/com/graphhire/job/interfaces/controller/PositionTypeController.java backend/src/main/java/com/graphhire/job/interfaces/dto/response/PositionTypeTreeNodeResponse.java backend/src/test/java/com/graphhire/publicapi/interfaces/controller/it/PublicJobControllerIT.java backend/src/test/java/com/graphhire/job/interfaces/controller/it/CompanyControllerIT.java
git commit -m "feat: 新增职位类型树接口并扩展岗位学历编码返回"
```

### Task 4: 初始化职位类型树数据导入（基于抓包文件）

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_05_02_019__seed_position_type_from_boss_json.sql`
- Read: `docs/抓包/boss-position-type-tree-names.json`
- Test: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/PositionTypeSeedSqlTest.java`
- Optional Script: `script/dev/generate-position-type-seed.ps1`

- [ ] **Step 1: 写失败测试（seed SQL 必须包含全量树插入）**

```java
@Test
void shouldSeedPositionTypeTreeFromCapturedJson() throws IOException {
    String sql = Files.readString(Path.of("src/main/resources/db/migration/V2026_05_02_019__seed_position_type_from_boss_json.sql"));
    assertTrue(sql.contains("INSERT INTO position_type"));
    assertTrue(sql.contains("技术"));
    assertTrue(sql.contains("产品"));
    assertTrue(sql.contains("后端开发"));
    assertTrue(sql.contains("Java"));
    assertTrue(sql.contains("parent_id"));
    assertTrue(sql.contains("ON CONFLICT (code) DO UPDATE"));
}
```

- [ ] **Step 2: 运行测试确认失败**

Run: `mvn -Dtest=PositionTypeSeedSqlTest test`
Expected: FAIL。

- [ ] **Step 3: 基于抓包 JSON 生成全量可重放 seed SQL（幂等）**

输入文件固定为：`D:/code/GraphHire/docs/抓包/boss-position-type-tree-names.json`。  
目标是把该树的全部节点（一级/二级/三级）生成到一个 SQL 文件中，按 `code, name, parent_id, level, sort_no, status, deleted` 插入，并使用 `ON CONFLICT (code) DO UPDATE` 做幂等更新。

```powershell
# script/dev/generate-position-type-seed.ps1（示例）
$jsonPath = "D:/code/GraphHire/docs/抓包/boss-position-type-tree-names.json"
$outPath  = "D:/code/GraphHire/backend/src/main/resources/db/migration/V2026_05_02_019__seed_position_type_from_boss_json.sql"
# 递归遍历 JSON 树，生成全量 INSERT ... ON CONFLICT SQL
```

```sql
INSERT INTO position_type (code, name, parent_id, level, sort_no, status, deleted)
VALUES
    (100000, '技术', NULL, 1, 1, 1, 0),
    (100100, '后端开发', 100000, 2, 1, 1, 0),
    (100101, 'Java', 100100, 3, 1, 1, 0)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id,
    level = EXCLUDED.level,
    sort_no = EXCLUDED.sort_no,
    status = EXCLUDED.status,
    deleted = EXCLUDED.deleted,
    update_time = CURRENT_TIMESTAMP;
```

- [ ] **Step 4: 运行测试确认通过（并核对节点数量）**

Run: `mvn -Dtest=PositionTypeSeedSqlTest test`
Expected: PASS。

并执行：

```bash
rg -n "INSERT INTO position_type|ON CONFLICT \\(code\\) DO UPDATE" backend/src/main/resources/db/migration/V2026_05_02_019__seed_position_type_from_boss_json.sql
```

Expected: 命中全量插入与幂等更新语句。

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/resources/db/migration/V2026_05_02_019__seed_position_type_from_boss_json.sql backend/src/test/java/com/graphhire/job/infrastructure/persistence/PositionTypeSeedSqlTest.java
git commit -m "feat: 初始化职位类型树数据"
```

### Task 5: 全量验证与发布记录

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 运行后端完整验证**

Run: `mvn compile`
Expected: BUILD SUCCESS。

- [ ] **Step 2: 运行后端测试**

Run: `mvn test`
Expected: BUILD SUCCESS，新增/改造测试全部通过。

- [ ] **Step 3: 更新发布记录**

```markdown
## 2026-05-02
- 新增 position_type 职位类型树表与初始化数据
- job.education 由文本改为 smallint 编码（1 中专、2 大专、3 本科、4 硕士、5 博士）
- job 新增 position_type_id 字段并打通公司端/公共端接口
```

- [ ] **Step 4: 最终提交**

```bash
git add RELEASE-NOTES.md
git commit -m "docs: 更新岗位学历编码与职位类型改造发布记录"
```

## Plan Self-Review

- Spec coverage: 覆盖了表结构变更、历史数据迁移、领域模型调整、接口返回调整、职位类型树查询与初始化数据导入。
- Placeholder scan: 无 TBD/TODO，占位步骤已替换为具体代码与命令。
- Type consistency: `job.education` 在 DB 与 Java 均为数值编码（`SMALLINT`/`Integer`），`job.position_type_id` 与 `position_type.id` 均为 `BIGINT`/`Long`。

