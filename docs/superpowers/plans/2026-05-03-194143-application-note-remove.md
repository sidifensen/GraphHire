# 投递记录 note 字段移除 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除 `application` 表无用的 `note` 字段，并完成后端代码与数据库结构同步。

**Architecture:** 采用“测试先行 + 最小实现”方式，先为服务层签名和状态更新行为补充失败测试，再进行数据库迁移、模型与 Mapper 清理，最后执行后端全量编译与测试验证。

**Tech Stack:** Spring Boot, MyBatis-Plus, PostgreSQL, JUnit5, Mockito

---

### Task 1: 先写失败测试锁定移除后的行为

**Files:**
- Modify: `backend/src/test/java/com/graphhire/application/application/service/ApplicationAppServiceTest.java`

- [ ] **Step 1: Write the failing test**

```java
@Test
@DisplayName("企业更新投递状态时不再依赖备注字段")
void updateApplicationStatus_shouldUpdateWithoutNote() {
    Long companyId = 30L;
    Long applicationId = 1L;

    Application application = new Application();
    application.setId(applicationId);
    application.setCompanyId(companyId);
    application.setStatus(ApplicationStatus.PENDING);

    when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
    when(applicationRepository.save(application)).thenReturn(application);

    Application updated = applicationAppService.updateApplicationStatus(companyId, applicationId, ApplicationStatus.REJECTED);

    assertEquals(ApplicationStatus.REJECTED, updated.getStatus());
    verify(applicationRepository).save(application);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `mvn -Dtest=ApplicationAppServiceTest test`
Expected: FAIL（方法签名不匹配，当前实现仍要求 `note` 参数）

### Task 2: 实现 application.note 全链路删除

**Files:**
- Modify: `backend/src/main/java/com/graphhire/application/domain/model/Application.java`
- Modify: `backend/src/main/java/com/graphhire/application/infrastructure/persistence/po/ApplicationPO.java`
- Modify: `backend/src/main/resources/mapper/application/ApplicationMapper.xml`
- Modify: `backend/src/main/java/com/graphhire/application/application/service/ApplicationAppService.java`
- Modify: `backend/src/main/java/com/graphhire/application/interfaces/controller/CompanyApplicationController.java`
- Modify: `backend/src/main/resources/db/schema.sql`
- Modify: `backend/src/main/resources/db/migration/V2026_04_16_001__add_application_tables.sql`
- Create: `backend/src/main/resources/db/migration/V2026_05_03_022__drop_application_note_column.sql`

- [ ] **Step 1: 移除领域对象与 PO 的 `note` 属性**
- [ ] **Step 2: 移除 MyBatis Mapper 中 `note` 字段映射、INSERT 与 UPDATE 列**
- [ ] **Step 3: 调整服务层 `updateApplicationStatus` 签名，去除 `note` 参数；面试邀请逻辑不再写 `note`**
- [ ] **Step 4: 调整控制器调用，去除状态更新接口 `note` 入参**
- [ ] **Step 5: 新增迁移脚本删除数据库字段，并同步更新 schema 与早期建表脚本**

### Task 3: 绿测与后端验证

**Files:**
- Modify: `backend/src/test/java/com/graphhire/application/application/service/ApplicationAppServiceTest.java`

- [ ] **Step 1: Run targeted test to verify GREEN**

Run: `mvn -Dtest=ApplicationAppServiceTest test`
Expected: PASS

- [ ] **Step 2: Run backend mandatory verification**

Run: `mvn compile`
Expected: BUILD SUCCESS

Run: `mvn test`
Expected: BUILD SUCCESS

### Task 4: 更新发布记录并提交

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 在 RELEASE-NOTES 追加本次变更摘要（移除 application.note）**
- [ ] **Step 2: 提交相关文件（中文提交信息，前缀符合规范）**

```bash
git add backend/src/main/java/com/graphhire/application/domain/model/Application.java \
  backend/src/main/java/com/graphhire/application/infrastructure/persistence/po/ApplicationPO.java \
  backend/src/main/resources/mapper/application/ApplicationMapper.xml \
  backend/src/main/java/com/graphhire/application/application/service/ApplicationAppService.java \
  backend/src/main/java/com/graphhire/application/interfaces/controller/CompanyApplicationController.java \
  backend/src/main/resources/db/schema.sql \
  backend/src/main/resources/db/migration/V2026_04_16_001__add_application_tables.sql \
  backend/src/main/resources/db/migration/V2026_05_03_022__drop_application_note_column.sql \
  backend/src/test/java/com/graphhire/application/application/service/ApplicationAppServiceTest.java \
  docs/superpowers/specs/2026-05-03-194143-application-note-remove-design.md \
  docs/superpowers/acceptance/2026-05-03-194143-application-note-remove-acceptance.md \
  docs/superpowers/plans/2026-05-03-194143-application-note-remove.md \
  RELEASE-NOTES.md

git commit -m "refactor: 移除投递记录note字段及相关引用"
```

