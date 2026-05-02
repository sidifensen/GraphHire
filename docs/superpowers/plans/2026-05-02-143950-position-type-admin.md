# Position Type 管理页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在管理端交付 `position_type` 三层树的完整管理能力，支持双视图展示与新增/编辑/启停/同级排序。  
**Architecture:** 后端新增 PositionType 领域服务与管理端接口，统一输出树形 DTO；前端基于同一数据源实现“树+详情/树形表格”双视图，所有操作后刷新树保持一致性。  
**Tech Stack:** Spring Boot + MyBatis-Plus + JUnit5(Mockito)、Next.js + React + Vitest + Testing Library

---

### Task 1: 后端 PositionType 领域服务（AC-004, AC-008~AC-018）

**Files:**
- Create: `backend/src/main/java/com/graphhire/positiontype/domain/model/PositionType.java`
- Create: `backend/src/main/java/com/graphhire/positiontype/domain/repository/PositionTypeRepository.java`
- Create: `backend/src/main/java/com/graphhire/positiontype/infrastructure/persistence/po/PositionTypePO.java`
- Create: `backend/src/main/java/com/graphhire/positiontype/infrastructure/persistence/mapper/PositionTypeMapper.java`
- Create: `backend/src/main/java/com/graphhire/positiontype/infrastructure/persistence/repository/PositionTypeRepositoryImpl.java`
- Create: `backend/src/main/java/com/graphhire/positiontype/application/service/PositionTypeAppService.java`
- Create: `backend/src/test/java/com/graphhire/positiontype/application/service/PositionTypeAppServiceTest.java`

- [ ] Step 1: 先写 `PositionTypeAppServiceTest`（层级约束、同级重名、上下移、级联启停、祖先自动启用）
- [ ] Step 2: 运行 `mvn -Dtest=PositionTypeAppServiceTest test`，确认失败（RED）
- [ ] Step 3: 实现领域模型、仓储接口与服务最小逻辑（GREEN）
- [ ] Step 4: 补实现 MyBatis PO/Mapper/RepositoryImpl，保证编译通过
- [ ] Step 5: 再次运行 `mvn -Dtest=PositionTypeAppServiceTest test`，确认通过

### Task 2: 管理端后端接口与 DTO（AC-004~AC-007, AC-013, AC-019）

**Files:**
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/dto/request/AdminPositionTypeCreateRequest.java`
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/dto/request/AdminPositionTypeUpdateRequest.java`
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/dto/request/AdminPositionTypeStatusUpdateRequest.java`
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/dto/request/AdminPositionTypeMoveRequest.java`
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/dto/response/AdminPositionTypeTreeItemResponse.java`
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminController.java`
- Modify: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`
- Modify: `backend/src/test/java/com/graphhire/admin/interfaces/controller/AdminControllerTest.java`

- [ ] Step 1: 先补 `AdminAppServiceTest`、`AdminControllerTest` 的 PositionType 场景（RED）
- [ ] Step 2: 运行 `mvn -Dtest=AdminAppServiceTest,AdminControllerTest test`，确认新增用例失败
- [ ] Step 3: 在 `AdminAppService` 注入 `PositionTypeAppService` 并实现树查询/新增/编辑/状态/移动方法
- [ ] Step 4: 在 `AdminController` 暴露 `/admin/position-type/*` 路由并透传参数
- [ ] Step 5: 再跑 `mvn -Dtest=AdminAppServiceTest,AdminControllerTest test`，确认通过

### Task 3: 前端 API 与导航接入（AC-001, AC-021）

**Files:**
- Modify: `frontend/src/lib/api/admin.ts`
- Modify: `frontend/src/components/admin/AdminSidebar.tsx`

- [ ] Step 1: 先写或补前端页面测试中对 API 参数与导航入口的断言（RED）
- [ ] Step 2: 运行 `npm run test:run -- src/tests/pages/admin-position-types-page.test.tsx`，确认失败
- [ ] Step 3: 在 `admin.ts` 增加 PositionType 类型与 API 方法
- [ ] Step 4: 在侧边栏添加“职位类型管理”导航项
- [ ] Step 5: 重跑对应测试，确认通过

### Task 4: PositionType 管理页双视图实现（AC-002, AC-003, AC-019, AC-020）

**Files:**
- Create: `frontend/src/app/admin/position-types/page.tsx`
- Create: `frontend/src/tests/pages/admin-position-types-page.test.tsx`

- [ ] Step 1: 先写页面测试（默认视图、视图切换、动作按钮触发 API、筛选参数透传）（RED）
- [ ] Step 2: 运行 `npm run test:run -- src/tests/pages/admin-position-types-page.test.tsx`，确认失败
- [ ] Step 3: 最小实现页面（加载树、split/table 切换、详情操作、表格渲染）
- [ ] Step 4: 增加新增/编辑弹窗与操作后刷新
- [ ] Step 5: 重跑页面测试，确认通过

### Task 5: 全量验证与交付（AC-022）

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] Step 1: 执行后端验证 `cd backend && mvn compile && mvn test`
- [ ] Step 2: 执行前端验证 `cd frontend && npm run build && npm run test:run`
- [ ] Step 3: 更新 `RELEASE-NOTES.md` 记录本次 PositionType 管理功能
- [ ] Step 4: 检查 `git diff`，确认仅包含本次改动

