# Admin 标签管理与任务监控对接（/admin 前缀）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改页面样式的前提下，将管理端“标签管理”“任务监控”全部对接到 `/admin/**` 后端接口，并输出真实数据与缺失项清单。

**Architecture:** 后端在 `AdminController` 下补齐 `/admin/skill-tags/**` 聚合接口，应用层通过 `AdminAppService` 复用既有 `SkillTagAppService` 能力。前端仅通过 `adminApi` 调用 `/admin/**`，页面保留现有结构与样式，仅替换 mock 数据为真实请求并接通已有按钮交互（新建/编辑/关系管理/筛选/刷新/重试）。

**Tech Stack:** Spring Boot, Next.js App Router, TypeScript, Vitest, JUnit5, CDP（chrome-devtools）

---

### Task 1: 后端新增 `/admin/skill-tags/**` 接口（TDD）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/admin/interfaces/controller/AdminControllerTest.java`
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminController.java`
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Create: `backend/src/main/java/com/graphhire/admin/interfaces/dto/request/AdminSkillTagUpsertRequest.java`

- [ ] **Step 1: 写失败测试（新增管理端标签接口用例）**

```java
@Nested
@DisplayName("管理端标签")
class AdminSkillTagManagementTests {
    @Test
    @DisplayName("创建标签")
    void createSkillTagSuccess() {
        var request = new AdminSkillTagUpsertRequest();
        request.setName("Go");
        request.setSynonyms(List.of("golang"));

        var result = adminController.createSkillTag(request);

        assertEquals(200, result.getCode());
        verify(adminAppService).createSkillTag(any());
    }
}
```

- [ ] **Step 2: 运行后端单测并确认失败**

Run: `cd backend; mvn -Dtest=AdminControllerTest test`
Expected: FAIL（方法或类型未定义）

- [ ] **Step 3: 最小实现控制器 + 应用层方法使测试通过**

```java
@PostMapping("/skill-tags")
public Result<SkillTag> createSkillTag(@RequestBody AdminSkillTagUpsertRequest request) {
    return Result.success(adminAppService.createSkillTag(request));
}
```

- [ ] **Step 4: 运行后端单测确认通过**

Run: `cd backend; mvn -Dtest=AdminControllerTest test`
Expected: PASS

### Task 2: 前端 API 统一到 `/admin/**`（TDD）

**Files:**
- Modify: `frontend/src/tests/pages/admin-skill-tags-null-category.test.tsx`
- Modify: `frontend/tests/pages/admin-skill-tags.test.tsx`
- Modify: `frontend/src/lib/api/admin.ts`

- [ ] **Step 1: 写失败测试（断言页面仅走 adminApi 的新接口）**

```ts
expect(adminApi.createSkillTag).toBeDefined();
expect(adminApi.addSkillTagSynonym).toBeDefined();
```

- [ ] **Step 2: 运行前端目标测试确认失败**

Run: `cd frontend; npm run test:run -- tests/pages/admin-skill-tags.test.tsx`
Expected: FAIL（API 方法不存在）

- [ ] **Step 3: 在 `adminApi` 添加 `/admin/skill-tags/**` 方法**

```ts
createSkillTag: async (data) => {
  const response = await apiClient.post('/admin/skill-tags', data);
  return response.data;
}
```

- [ ] **Step 4: 再次运行目标测试确认通过**

Run: `cd frontend; npm run test:run -- tests/pages/admin-skill-tags.test.tsx`
Expected: PASS

### Task 3: 标签管理页接真实数据与操作（TDD）

**Files:**
- Modify: `frontend/src/tests/pages/admin-skill-tags-null-category.test.tsx`
- Modify: `frontend/tests/pages/admin-skill-tags.test.tsx`
- Modify: `frontend/src/app/admin/skill-tags/page.tsx`

- [ ] **Step 1: 写失败测试（加载列表、点击新建/编辑/管理关系会调用 adminApi）**

```ts
fireEvent.click(screen.getByRole('button', { name: '新建标签' }));
await waitFor(() => expect(adminApi.createSkillTag).toHaveBeenCalled());
```

- [ ] **Step 2: 运行前端目标测试确认失败**

Run: `cd frontend; npm run test:run -- tests/pages/admin-skill-tags.test.tsx src/tests/pages/admin-skill-tags-null-category.test.tsx`
Expected: FAIL

- [ ] **Step 3: 最小实现页面数据流与按钮事件（不改样式）**

```ts
useEffect(() => { void loadSkills(); }, []);
const loadSkills = async () => setSkills((await adminApi.getSkillList(params)).list);
```

- [ ] **Step 4: 运行目标测试确认通过**

Run: `cd frontend; npm run test:run -- tests/pages/admin-skill-tags.test.tsx src/tests/pages/admin-skill-tags-null-category.test.tsx`
Expected: PASS

### Task 4: 任务监控页接真实数据与重试/筛选（TDD）

**Files:**
- Modify: `frontend/tests/pages/admin-task-monitor.test.tsx`
- Modify: `frontend/src/app/admin/task-monitor/page.tsx`

- [ ] **Step 1: 写失败测试（刷新/筛选触发 getTaskList，重试触发 retryTask）**

```ts
fireEvent.click(screen.getByRole('button', { name: /刷新/ }));
await waitFor(() => expect(adminApi.getTaskList).toHaveBeenCalledTimes(2));
```

- [ ] **Step 2: 运行目标测试确认失败**

Run: `cd frontend; npm run test:run -- tests/pages/admin-task-monitor.test.tsx`
Expected: FAIL

- [ ] **Step 3: 最小实现任务页真实数据渲染与交互**

```ts
const response = await adminApi.getTaskList(filters);
setSummary(response.summary);
setTasks(response.list);
```

- [ ] **Step 4: 运行目标测试确认通过**

Run: `cd frontend; npm run test:run -- tests/pages/admin-task-monitor.test.tsx`
Expected: PASS

### Task 5: 全量验证 + 浏览器真实数据截图 + 缺失清单

**Files:**
- Modify: `RELEASE-NOTES.md`（如项目已有该文件）

- [ ] **Step 1: 后端编译测试**

Run: `cd backend; mvn compile; mvn test`
Expected: PASS

- [ ] **Step 2: 前端编译测试**

Run: `cd frontend; npm run build; npm run test:run`
Expected: PASS

- [ ] **Step 3: 使用 CDP 打开管理端验证并截图**

Run: 通过 chrome-devtools 打开 `http://localhost:8888/admin/skill-tags` 与 `http://localhost:8888/admin/task-monitor`，采集真实数据截图。
Expected: 页面展示真实接口数据

- [ ] **Step 4: 产出缺失项清单并提交**

Run: `git add ...; git commit -m "fix(admin): 管理端标签与任务监控对接后端接口"`
Expected: 提交成功
