# 删除 position_type.code 字段 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 删除职位类型表的冗余 `code` 字段，并保持数据库、后端接口、前端页面和测试一致通过。

**Architecture:** 采用 TDD：先修改断言制造红灯，再执行最小实现（DB + backend + frontend），最后跑前后端全量验证并更新发布说明。

**Tech Stack:** Spring Boot, Flyway, MyBatis-Plus, JUnit5, Next.js, TypeScript, Vitest

---

### Task 1: 测试先行（RED）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/JobSchemaSqlTest.java`
- Modify: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/PositionTypeSeedSqlTest.java`
- Modify: `frontend/src/tests/pages/admin-position-types-page.test.tsx`

- [ ] **Step 1: 修改 `JobSchemaSqlTest`，将 `position_type.code` 必须存在断言改为必须不存在**
- [ ] **Step 2: 修改 `PositionTypeSeedSqlTest`，期望冲突键为 `ON CONFLICT (id)` 而非 `(code)`**
- [ ] **Step 3: 修改前端职位类型页面测试 mock，移除 `code` 字段**
- [ ] **Step 4: 分别运行后端定向测试与前端定向测试，确认红灯（实现未改前）**

Run: `mvn -Dtest=JobSchemaSqlTest,PositionTypeSeedSqlTest test`  
Expected: FAIL（当前实现仍包含 `code` 相关定义）

Run: `npm run test:run -- src/tests/pages/admin-position-types-page.test.tsx`  
Expected: 初始可能 PASS（类型宽松），作为回归基线；若失败则先记录失败原因。

### Task 2: 数据库与后端最小实现（GREEN）

**Files:**
- Create: `backend/src/main/resources/db/migration/V2026_05_06_028__drop_position_type_code_column.sql`
- Modify: `backend/src/main/resources/db/schema.sql`
- Modify: `backend/src/main/resources/db/migration/V2026_05_02_019__seed_position_type_from_boss_json.sql`
- Modify: `backend/src/main/resources/db/migration/V2026_05_06_027__add_position_type_comments.sql`
- Modify: `script/dev/generate-position-type-seed.ps1`
- Modify: `backend/src/main/java/com/graphhire/positiontype/domain/model/PositionType.java`
- Modify: `backend/src/main/java/com/graphhire/positiontype/infrastructure/persistence/po/PositionTypePO.java`
- Modify: `backend/src/main/java/com/graphhire/positiontype/domain/repository/PositionTypeRepository.java`
- Modify: `backend/src/main/java/com/graphhire/positiontype/infrastructure/persistence/repository/PositionTypeRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/positiontype/infrastructure/persistence/mapper/PositionTypeMapper.java`
- Modify: `backend/src/main/java/com/graphhire/positiontype/application/service/PositionTypeAppService.java`
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/dto/response/AdminPositionTypeTreeItemResponse.java`
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Modify: `backend/src/test/java/com/graphhire/positiontype/application/service/PositionTypeAppServiceTest.java`
- Modify: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`

- [ ] **Step 1: 新增迁移脚本删除 `position_type.code` 列（幂等处理）**
- [ ] **Step 2: 更新 schema 与注释迁移，移除 `code` 字段定义/注释**
- [ ] **Step 3: 更新 seed SQL 与生成脚本，改为 `ON CONFLICT (id)`**
- [ ] **Step 4: 删除后端领域/持久化/仓储/Mapper 的 `code` 与 `nextCode` 链路**
- [ ] **Step 5: 删除管理端后端 DTO 返回中的 `code` 字段与赋值**
- [ ] **Step 6: 同步修复受影响后端单测构造数据**
- [ ] **Step 7: 运行 `mvn -Dtest=JobSchemaSqlTest,PositionTypeSeedSqlTest,PositionTypeAppServiceTest,AdminAppServiceTest test` 确认绿灯**

Run: `mvn -Dtest=JobSchemaSqlTest,PositionTypeSeedSqlTest,PositionTypeAppServiceTest,AdminAppServiceTest test`  
Expected: BUILD SUCCESS

### Task 3: 前端实现与全量验证

**Files:**
- Modify: `frontend/src/lib/api/admin.ts`
- Modify: `frontend/src/app/admin/position-types/page.tsx`
- Modify: `frontend/src/tests/pages/admin-position-types-page.test.tsx`
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 删除前端 `AdminPositionTypeItem.code` 类型定义**
- [ ] **Step 2: 删除职位类型详情面板中的“编码”展示行**
- [ ] **Step 3: 确认职位类型页面测试通过**
- [ ] **Step 4: 执行后端全量验证 `mvn compile`、`mvn test`**
- [ ] **Step 5: 执行前端全量验证 `npm run build`、`npm run test:run`**
- [ ] **Step 6: 更新 `RELEASE-NOTES.md` 记录本次删除字段变更**

Run: `mvn compile`  
Expected: BUILD SUCCESS

Run: `mvn test`  
Expected: BUILD SUCCESS

Run: `npm run build`  
Expected: build success

Run: `npm run test:run`  
Expected: all tests passed
