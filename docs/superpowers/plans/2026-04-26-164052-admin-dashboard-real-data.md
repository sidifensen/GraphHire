# Admin 仪表盘真实数据改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将管理端仪表盘中的 `活跃概览`、`待办与预警`、`热门技能`、`系统动态`、`近30天平台活跃趋势` 从前端 mock 替换为后端真实聚合数据。

**Architecture:** 后端新增一个仪表盘明细聚合响应（基于现有业务事件拼装，不新增日志子系统）；前端新增对应 API 类型并改造 dashboard 页面消费新字段；通过 TDD 先补失败测试再实现。待办与预警是“可执行事项聚合”，系统动态是“时间线事件流”。

**Tech Stack:** Spring Boot, MyBatis-Plus, Next.js, TypeScript, Vitest, JUnit

---

### Task 1: 定义后端仪表盘明细 DTO（待办/热门技能/系统动态/活跃概览/趋势）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/dto/response/DashboardStatsResponse.java`
- Test: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`（若不存在则创建）

- [ ] **Step 1: 写失败测试（断言新字段存在并有默认值）**

```java
@Test
void getDashboardStats_ShouldContainDashboardDetailBlocks() {
    DashboardStatsResponse resp = adminAppService.getDashboardStats();
    assertNotNull(resp.getActiveOverview());
    assertNotNull(resp.getTrend());
    assertNotNull(resp.getTodos());
    assertNotNull(resp.getHotSkills());
    assertNotNull(resp.getSystemActivities());
}
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd backend; mvn -Dtest=AdminAppServiceTest test`
Expected: FAIL（缺少 getter/字段）

- [ ] **Step 3: 最小实现 DTO 字段与内部类**

```java
private ActiveOverview activeOverview;
private List<TrendPoint> trend = new ArrayList<>();
private List<TodoItem> todos = new ArrayList<>();
private List<HotSkillItem> hotSkills = new ArrayList<>();
private List<SystemActivityItem> systemActivities = new ArrayList<>();
```

- [ ] **Step 4: 再跑测试确认通过**

Run: `cd backend; mvn -Dtest=AdminAppServiceTest test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/graphhire/admin/interfaces/dto/response/DashboardStatsResponse.java backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java
git commit -m "feat(admin): 补充仪表盘明细响应模型"
```

### Task 2: 后端拼装“近30天平台活跃趋势”

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Test: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`

- [ ] **Step 1: 写失败测试（trend 返回最近30天数据点）**

```java
@Test
void getDashboardStats_ShouldReturnThirtyDaysTrend() {
    DashboardStatsResponse resp = adminAppService.getDashboardStats();
    assertNotNull(resp.getTrend());
    assertTrue(resp.getTrend().size() <= 30);
}
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd backend; mvn -Dtest=AdminAppServiceTest test`
Expected: FAIL（trend 仍为空实现）

- [ ] **Step 3: 最小实现趋势聚合**

```java
response.setTrend(buildRecent30DaysTrend());
```

实现规则：
- `date`：`yyyy-MM-dd`
- `activeUsers`：按天活跃用户数
- `newData`：按天匹配成功量（与图表“匹配成功”口径一致）
- 按日期升序返回，最多 30 点
- 无数据时返回空数组，不填 mock

- [ ] **Step 4: 再跑测试确认通过**

Run: `cd backend; mvn -Dtest=AdminAppServiceTest test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java
git commit -m "feat(admin): 增加近30天平台活跃趋势聚合"
```

### Task 3: 后端拼装“待办与预警”与“系统动态”（B 方案：现有事件聚合）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Test: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`

- [ ] **Step 1: 写失败测试（待办 3 条固定语义 + 系统动态按时间倒序）**

```java
@Test
void getDashboardStats_ShouldBuildTodosAndActivitiesFromExistingEvents() {
    DashboardStatsResponse resp = adminAppService.getDashboardStats();
    assertEquals(3, resp.getTodos().size());
    assertTrue(resp.getTodos().stream().anyMatch(t -> t.getType().equals("FAILED_TASK")));
    assertTrue(resp.getTodos().stream().anyMatch(t -> t.getType().equals("PENDING_COMPANY_AUDIT")));
    assertTrue(resp.getTodos().stream().anyMatch(t -> t.getType().equals("SKILL_GOVERNANCE")));
    assertNotNull(resp.getSystemActivities());
}
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd backend; mvn -Dtest=AdminAppServiceTest test`
Expected: FAIL（数据尚未组装）

- [ ] **Step 3: 最小实现聚合逻辑**

```java
response.setTodos(buildTodoItems(pendingCompanyAudit, pendingTaskCount, failedTaskCount, skillCount));
response.setSystemActivities(buildSystemActivities(companies, tasks, skills, notifications));
```

实现规则：
- 待办固定 3 条：
  - `FAILED_TASK`（失败任务）
  - `PENDING_COMPANY_AUDIT`（待审核企业）
  - `SKILL_GOVERNANCE`（技能治理）
- 系统动态来源：企业审核事件、任务成功/失败事件、技能标签变更事件、系统通知；统一按时间倒序，截断 Top N（建议 8）。

- [ ] **Step 4: 再跑测试确认通过**

Run: `cd backend; mvn -Dtest=AdminAppServiceTest test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java
git commit -m "feat(admin): 基于现有业务事件聚合待办与系统动态"
```

### Task 4: 后端拼装“热门技能”与“活跃概览”

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Test: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`

- [ ] **Step 1: 写失败测试（热门技能 Top5 + 活跃骑士对象）**

```java
@Test
void getDashboardStats_ShouldContainHotSkillsAndActiveOverview() {
    DashboardStatsResponse resp = adminAppService.getDashboardStats();
    assertTrue(resp.getHotSkills().size() <= 5);
    assertNotNull(resp.getActiveOverview());
}
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd backend; mvn -Dtest=AdminAppServiceTest test`
Expected: FAIL

- [ ] **Step 3: 最小实现聚合规则**

```java
response.setHotSkills(buildHotSkillsTop5(skillTagAppService.getAllSkillTags()));
response.setActiveOverview(buildActiveOverview(dailyActiveUsers, response.getTaskSuccessRate(), matchCount));
```

实现规则：
- 热门技能：按 `usageCount` 降序取 Top 5，输出名称 + 热度百分比（相对 Top1 归一化）。
- 活跃骑士：使用现有统计拼装（`dailyActiveUsers`、任务成功率、匹配量趋势）并输出统一文案字段。

- [ ] **Step 4: 再跑测试确认通过**

Run: `cd backend; mvn -Dtest=AdminAppServiceTest test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java
git commit -m "feat(admin): 补充热门技能与活跃概览聚合数据"
```

### Task 5: 前端 API 类型与数据映射改造

**Files:**
- Modify: `frontend/src/lib/api/admin.ts`
- Test: `frontend/tests/lib/api/admin.test.ts`（若不存在则创建）

- [ ] **Step 1: 写失败测试（dashboard 返回结构包含 4 块新字段）**

```ts
it('should type dashboard detail blocks', async () => {
  const data = await adminApi.getDashboardStats();
  expect(data.todos).toBeDefined();
  expect(data.hotSkills).toBeDefined();
  expect(data.systemActivities).toBeDefined();
  expect(data.activeKnight).toBeDefined();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd frontend; npm run test:run -- admin`
Expected: FAIL（类型缺失）

- [ ] **Step 3: 最小实现 TS 接口扩展**

```ts
export interface AdminTodoItem { ... }
export interface AdminHotSkillItem { ... }
export interface AdminSystemActivityItem { ... }
export interface AdminActiveKnight { ... }
```

- [ ] **Step 4: 再跑测试确认通过**

Run: `cd frontend; npm run test:run -- admin`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/api/admin.ts frontend/tests/lib/api/admin.test.ts
git commit -m "feat(frontend): 扩展管理端仪表盘明细数据类型"
```

### Task 6: 前端 dashboard 页面替换 mock（待办、热门技能、系统动态、活跃概览、趋势图）

**Files:**
- Modify: `frontend/src/app/admin/dashboard/page.tsx`
- Test: `frontend/tests/pages/admin-dashboard.test.tsx`

- [ ] **Step 1: 写失败测试（不再依赖写死文案数组，渲染接口返回项）**

```ts
it('renders todos/hotSkills/systemActivities from api payload', async () => {
  vi.mocked(adminApi.getDashboardStats).mockResolvedValue(mockDashboardWithDetails);
  render(<AdminDashboardPage />);
  expect(await screen.findByText('失败任务 7 个')).toBeInTheDocument();
  expect(screen.getByText('Java')).toBeInTheDocument();
  expect(screen.getByText('Admin Li')).toBeInTheDocument();
  expect(screen.getByText('2026-04-01')).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd frontend; npm run test:run -- admin-dashboard`
Expected: FAIL

- [ ] **Step 3: 最小实现页面渲染替换**

```tsx
{stats?.todos?.map(...)}
{stats?.hotSkills?.map(...)}
{stats?.systemActivities?.map(...)}
<ActiveOverviewCard data={stats?.activeOverview} />
<BarChart data={stats?.trend ?? []} />
```

- [ ] **Step 4: 再跑测试确认通过**

Run: `cd frontend; npm run test:run -- admin-dashboard`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/admin/dashboard/page.tsx frontend/tests/pages/admin-dashboard.test.tsx
git commit -m "feat(frontend): 仪表盘五块区域切换真实后端数据"
```

### Task 7: 前端趋势切换策略（日/周/月）与空态

**Files:**
- Modify: `frontend/src/app/admin/dashboard/page.tsx`
- Test: `frontend/tests/pages/admin-dashboard.test.tsx`

- [ ] **Step 1: 写失败测试（日/周/月状态与空态）**

```ts
it('shows empty state when trend data is empty', async () => {
  vi.mocked(adminApi.getDashboardStats).mockResolvedValue({ ...mockDashboardWithDetails, trend: [] });
  render(<AdminDashboardPage />);
  expect(await screen.findByText('暂无趋势数据')).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd frontend; npm run test:run -- admin-dashboard`
Expected: FAIL

- [ ] **Step 3: 最小实现交互策略**

```tsx
// 第一阶段：默认只启用“日”，周/月按钮禁用并标注“开发中”
```

- [ ] **Step 4: 再跑测试确认通过**

Run: `cd frontend; npm run test:run -- admin-dashboard`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/admin/dashboard/page.tsx frontend/tests/pages/admin-dashboard.test.tsx
git commit -m "feat(frontend): 补充趋势图空态与切换策略"
```

### Task 8: 全量验证（强制项）

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 前端构建验证**

Run: `cd frontend; npm run build`
Expected: BUILD SUCCESS

- [ ] **Step 2: 后端编译验证**

Run: `cd backend; mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 3: 前端测试验证**

Run: `cd frontend; npm run test:run`
Expected: ALL PASS

- [ ] **Step 4: 后端测试验证**

Run: `cd backend; mvn test`
Expected: ALL PASS

- [ ] **Step 5: 浏览器验证（/web-access + CDP）**

Run:
1. 启动前后端（按项目约定端口 8888/7777）
2. 用 CDP 打开 `http://localhost:8888/admin/dashboard`
3. 校验四块区域已是接口数据而非硬编码文案

Expected:
- 待办与预警显示真实计数和跳转按钮
- 热门技能为后端 Top5
- 系统动态为时间线事件
- 活跃概览展示后端聚合值

- [ ] **Step 6: 更新发布说明并提交**

```bash
git add RELEASE-NOTES.md
git commit -m "docs: 更新管理端仪表盘真实数据改造说明"
```
