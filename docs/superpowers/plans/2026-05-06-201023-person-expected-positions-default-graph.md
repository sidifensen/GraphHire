# 个人资料期望职位与默认职位图谱联动 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在个人资料页新增“期望职位多选+默认职位”配置，并让默认职位优先参与个人图谱技能分类（无配置时自动 AI 生成）。

**Architecture:** 前端抽离可复用职位选择弹窗组件，个人资料页复用该组件实现多选并设置默认职位；后端扩展 `person_info` 结构与资料 DTO/Repository；图谱分类服务新增“优先默认职位”分支并按需触发 profile bootstrap。全流程采用 TDD：先失败测试，再最小实现。

**Tech Stack:** Next.js 16 + React 19 + Vitest，Spring Boot 3.4 + Mockito/JUnit5，PostgreSQL

---

### Task 1: 文档与数据库基线扩展

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_05_06_030__add_person_expected_position_fields.sql`
- Modify: `backend/src/main/resources/db/schema.sql`

- [ ] **Step 1: 新增迁移脚本**

```sql
ALTER TABLE person_info
    ADD COLUMN IF NOT EXISTS expected_position_type_ids BIGINT[],
    ADD COLUMN IF NOT EXISTS default_position_type_id BIGINT;

COMMENT ON COLUMN person_info.expected_position_type_ids IS '期望职位类型ID列表（position_type叶子节点）';
COMMENT ON COLUMN person_info.default_position_type_id IS '默认期望职位类型ID（需属于期望职位列表）';
```

- [ ] **Step 2: 同步 schema.sql**

在 `person_info` 建表定义与注释区补齐以上字段，保持基线一致。

### Task 2: 先写后端失败测试（RED）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/resume/interfaces/controller/PersonControllerTest.java`
- Modify: `backend/src/test/java/com/graphhire/positiontypeskill/application/service/PositionTypeSkillClassificationServiceTest.java`

- [ ] **Step 1: PersonControllerTest 增加期望职位字段保存与分类入参断言**

```java
request.setExpectedPositionTypeIds(List.of(100101L, 100102L));
request.setDefaultPositionTypeId(100102L);
verify(personInfoRepository).save(captor.capture());
assertEquals(List.of(100101L, 100102L), saved.getExpectedPositionTypeIds());
assertEquals(100102L, saved.getDefaultPositionTypeId());
```

- [ ] **Step 2: PositionTypeSkillClassificationServiceTest 增加“默认职位优先”用例**

```java
Map<String, Object> result = service.classifyPersonSkills(List.of("Java"), 100102L);
Map<String, Object> positionTypeMatch = (Map<String, Object>) result.get("positionTypeMatch");
assertEquals(100102L, ((Number) positionTypeMatch.get("positionTypeId")).longValue());
```

- [ ] **Step 3: 运行后端目标测试确认失败**

Run:
```bash
mvn -Dtest=PersonControllerTest,PositionTypeSkillClassificationServiceTest test
```
Expected: FAIL（字段/方法尚未实现）。

### Task 3: 实现后端（GREEN）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/domain/model/PersonInfo.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/dto/request/PersonUpdateRequest.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/dto/PersonInfoResponse.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/po/PersonInfoPO.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/PersonInfoRepositoryImpl.java`
- Create: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/typehandler/LongListArrayTypeHandler.java`
- Modify: `backend/src/main/java/com/graphhire/positiontypeskill/application/service/PositionTypeSkillClassificationService.java`

- [ ] **Step 1: 打通 person_info 新字段持久化链路**

为 Domain/DTO/PO/Repository 增加 `expectedPositionTypeIds` 与 `defaultPositionTypeId`。

- [ ] **Step 2: Controller 增加资料校验与保存**

默认职位不在期望列表时置空；空列表时默认职位置空。

- [ ] **Step 3: 分类服务新增重载并优先默认职位**

新增 `classifyPersonSkills(List<String> rawSkills, Long preferredPositionTypeId)`；
无 profile 时调用 `IndustrySkillProfileBootstrapService.bootstrapByPositionTypeId(...)` 后重试。

- [ ] **Step 4: getPersonGraph 传递默认职位**

```java
Long preferredPositionTypeId = personInfo == null ? null : personInfo.getDefaultPositionTypeId();
Map<String, Object> classified = positionTypeSkillClassificationService.classifyPersonSkills(skills, preferredPositionTypeId);
```

- [ ] **Step 5: 运行后端目标测试确认通过**

Run:
```bash
mvn -Dtest=PersonControllerTest,PositionTypeSkillClassificationServiceTest test
```
Expected: PASS。

### Task 4: 先写前端失败测试（RED）

**Files:**
- Modify: `frontend/src/tests/pages/user-personal-info-page.test.tsx`

- [ ] **Step 1: 新增期望职位与默认职位断言与保存断言**

```tsx
expect(screen.getByText('Java')).toBeInTheDocument();
expect(screen.getByLabelText('默认职位')).toHaveValue('100101');
expect(updateProfileMock).toHaveBeenCalledWith(
  expect.objectContaining({
    expectedPositionTypeIds: [100101, 100102],
    defaultPositionTypeId: 100101,
  }),
);
```

- [ ] **Step 2: 运行前端目标测试确认失败**

Run:
```bash
npm run test:run -- src/tests/pages/user-personal-info-page.test.tsx
```
Expected: FAIL（页面尚未实现新功能）。

### Task 5: 实现前端复用弹窗与个人资料集成（GREEN）

**Files:**
- Create: `frontend/src/components/user/PositionTypePickerModal.tsx`
- Modify: `frontend/src/app/(user)/jobs/page.tsx`
- Modify: `frontend/src/app/(user)/personal-info/page.tsx`
- Modify: `frontend/src/lib/api/person.ts`

- [ ] **Step 1: 抽离职位选择弹窗组件**

将职位树三列选择 + 已选标签 + 清空/取消/确定抽成可复用组件。

- [ ] **Step 2: jobs 页替换为复用组件**

保持测试语义不变（`category-modal`、已选标签、三列选择逻辑一致）。

- [ ] **Step 3: personal-info 页接入复用组件**

新增“期望职位”入口、已选标签、默认职位下拉；保存时提交后端字段。

- [ ] **Step 4: 运行前端目标测试确认通过**

Run:
```bash
npm run test:run -- src/tests/pages/user-personal-info-page.test.tsx
npm run test:run -- tests/pages/user-jobs-page.test.tsx
```
Expected: PASS。

### Task 6: 全量验证与提交

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 后端验证**

Run:
```bash
mvn compile
mvn test
```

- [ ] **Step 2: 前端验证**

Run:
```bash
npm run build
npm run test:run
```

- [ ] **Step 3: 更新发布记录**

在 `RELEASE-NOTES.md` 的 `2026-05-06` 下追加本次改动摘要。

- [ ] **Step 4: 提交代码**

```bash
git add .
git commit -m "feat: 个人资料新增期望职位多选并按默认职位驱动图谱分类"
```

