# User Immersive Skill Graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构用户端“我的图谱”页面为沉浸式可拖拽图谱，并让后端 `/person/graph` 返回真实姓名用于中心节点展示。

**Architecture:** 后端在 `PersonController.getPersonGraph` 上做向后兼容扩展，组合图谱技能数据与 `PersonInfo` 的真实姓名/头像地址。前端保留左侧工作台菜单，改造 `/skill-graph` 为 `react-force-graph-2d` 全幅画布，并在右下角以纯文本展示能力概览数字。测试采用 TDD：先写失败测试，再最小实现使其通过。

**Tech Stack:** Spring Boot 3.4、Mockito/JUnit5、Next.js 16、React 19、Vitest、react-force-graph-2d

---

### Task 1: 后端接口契约扩展（/person/graph 增加 realName/avatarUrl）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java`
- Test: `backend/src/test/java/com/graphhire/resume/interfaces/controller/PersonControllerTest.java`

- [ ] **Step 1: 写失败测试（返回真实姓名与头像地址）**

```java
@Test
@DisplayName("获取个人图谱时附带真实姓名与头像访问地址")
void getPersonGraph_IncludesRealNameAndAvatarUrl() {
    // arrange stubs
    // act personController.getPersonGraph()
    // assert data.realName/data.avatarUrl present
}
```

- [ ] **Step 2: 运行后端单测确认 RED**

Run: `mvn -Dtest=PersonControllerTest test`
Expected: FAIL，提示图谱返回结构缺少 `realName` 或 `avatarUrl`。

- [ ] **Step 3: 最小实现让测试通过**

```java
@GetMapping("/graph")
public Result<Map<String, Object>> getPersonGraph() {
    Long userId = StpUtil.getLoginIdAsLong();
    Map<String, Object> graph = skillGraphClient.getPersonSkillGraph(userId);

    PersonInfo personInfo = personInfoRepository.findByUserId(userId).orElse(null);
    graph.put("realName", personInfo == null ? null : personInfo.getRealName());
    graph.put("avatarUrl", personInfo == null || personInfo.getAvatarUrl() == null ? null : "/person/avatar/public/" + userId);

    return Result.success(graph);
}
```

- [ ] **Step 4: 运行后端单测确认 GREEN**

Run: `mvn -Dtest=PersonControllerTest test`
Expected: PASS。

### Task 2: 前端 API 类型与图谱页测试重构（RED）

**Files:**
- Modify: `frontend/src/lib/api/person.ts`
- Modify: `frontend/src/tests/pages/user-skill-graph-page.test.tsx`

- [ ] **Step 1: 先更新测试以反映新交互与数据契约（失败预期）**

```tsx
getGraphMock.mockResolvedValue({
  personId: 99,
  realName: '斯蒂芬森',
  avatarUrl: '/person/avatar/public/99',
  skills: ['Java', 'Spring Boot', 'React'],
  success: true,
});

expect(screen.getByText('斯蒂芬森')).toBeInTheDocument();
expect(screen.getByText('综合分')).toBeInTheDocument();
expect(screen.getByText('知识节点')).toBeInTheDocument();
```

- [ ] **Step 2: 运行前端目标测试确认 RED**

Run: `npm run test:run -- src/tests/pages/user-skill-graph-page.test.tsx`
Expected: FAIL，页面尚未渲染中心姓名/沉浸式新结构。

- [ ] **Step 3: 更新前端类型（最小契约补齐）**

```ts
export interface SkillGraph {
  personId?: number;
  realName?: string | null;
  avatarUrl?: string | null;
  skills?: string[];
  success?: boolean;
  mock?: boolean;
}
```

- [ ] **Step 4: 运行前端目标测试（仍应失败，等待页面实现）**

Run: `npm run test:run -- src/tests/pages/user-skill-graph-page.test.tsx`
Expected: FAIL（页面行为未改）。

### Task 3: 沉浸式图谱页面实现（GREEN）

**Files:**
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx`
- Modify: `frontend/src/app/(user)/_components/UserWorkbenchSidebar.tsx`

- [ ] **Step 1: 引入 force graph 并构建节点/边模型**

```tsx
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';

type SkillNode = { id: string; label: string; type: 'person' | 'skill'; avatarUrl?: string | null; };
type SkillLink = { source: string; target: string };
```

- [ ] **Step 2: 以 `/person/graph` + `/person/ability-assessment` 填充沉浸式画布**

```tsx
const personName = graph.realName?.trim() || '求职者';
const nodes = [{ id: personId, label: personName, type: 'person' }, ...skillsNodes];
const links = skillsNodes.map((item) => ({ source: personId, target: item.id }));
```

- [ ] **Step 3: 右下角改为纯数字文字信息层（非卡片）**

```tsx
<div className="absolute right-6 bottom-6">
  <div>{totalScore}</div>
  <div>综合分 · {levelText}</div>
  <div>{skillCount} 知识节点</div>
</div>
```

- [ ] **Step 4: 左侧菜单透明化且仅图谱页生效**

```tsx
<UserWorkbenchSidebar variant="transparent" />
```

- [ ] **Step 5: 运行图谱页测试确认 GREEN**

Run: `npm run test:run -- src/tests/pages/user-skill-graph-page.test.tsx`
Expected: PASS。

### Task 4: 回归测试与构建验证

**Files:**
- Modify: `frontend/src/tests/pages/user-workbench-layout-consistency.test.tsx`（如需）
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 运行后端编译与测试**

Run:
```bash
mvn compile
mvn test
```
Expected: PASS。

- [ ] **Step 2: 运行前端构建与测试**

Run:
```bash
npm run build
npm run test:run
```
Expected: PASS。

- [ ] **Step 3: 更新发行记录**

在 `RELEASE-NOTES.md` 追加本次变更摘要（后端字段扩展 + 前端沉浸式图谱改造）。

- [ ] **Step 4: Git 提交**

```bash
git add backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java \
        backend/src/test/java/com/graphhire/resume/interfaces/controller/PersonControllerTest.java \
        frontend/src/lib/api/person.ts \
        frontend/src/app/(user)/_components/UserWorkbenchSidebar.tsx \
        frontend/src/app/(user)/skill-graph/page.tsx \
        frontend/src/tests/pages/user-skill-graph-page.test.tsx \
        docs/superpowers/specs/2026-05-05-200447-user-immersive-skill-graph-design.md \
        docs/superpowers/acceptance/2026-05-05-200447-user-immersive-skill-graph-acceptance.md \
        docs/superpowers/plans/2026-05-05-200447-user-immersive-skill-graph.md \
        RELEASE-NOTES.md

git commit -m "feat: 重构用户端沉浸式技能图谱并扩展图谱接口姓名字段"
```
