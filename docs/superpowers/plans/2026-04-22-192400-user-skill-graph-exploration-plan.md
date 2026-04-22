# 用户端能力图谱探索交互升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户端能力图谱页面升级为可平移、可缩放、可拖拽的沉浸式探索图谱，且不新增后端字段。

**Architecture:** 保留现有页面路由与接口调用，使用 `react-force-graph-2d` 接管图谱渲染层。前端将 `skills` 映射为节点与连线，并通过本地状态驱动聚焦信息面板与重置视图行为。所有业务数据仍由现有 `personApi.getGraph()` 提供。

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library, react-force-graph-2d

---

### Task 1: 补齐能力图谱页测试（RED）

**Files:**
- Create: `frontend/src/tests/pages/skill-graph.test.tsx`
- Modify: `frontend/src/tests/setup.tsx`
- Test: `frontend/src/tests/pages/skill-graph.test.tsx`

- [ ] **Step 1: 编写失败测试，覆盖加载/错误/空态/图谱渲染/重置按钮与聚焦信息**

```tsx
it('renders loading and then graph data', async () => {
  render(<SkillGraphPage />);
  expect(screen.getByText('图谱数据加载中...')).toBeDefined();
  await screen.findByText('重置视图');
});
```

- [ ] **Step 2: 运行单测确认失败**

Run: `cd frontend && npm run test:run -- src/tests/pages/skill-graph.test.tsx`
Expected: FAIL（当前页面不含新图谱组件与重置行为）

- [ ] **Step 3: 为图谱库提供测试 mock（最小实现）**

```tsx
vi.mock('react-force-graph-2d', () => ({
  default: forwardRef((props: any, ref) => {
    useImperativeHandle(ref, () => ({ zoomToFit: vi.fn() }));
    return <div data-testid="force-graph" />;
  }),
}));
```

- [ ] **Step 4: 重新运行单测确认仍为失败但失败原因聚焦到页面实现缺失**

Run: `cd frontend && npm run test:run -- src/tests/pages/skill-graph.test.tsx`
Expected: FAIL（断言的文案/按钮/状态卡未满足）

- [ ] **Step 5: 提交测试基线**

```bash
git add frontend/src/tests/pages/skill-graph.test.tsx frontend/src/tests/setup.tsx
git commit -m "test(skill-graph): 新增图谱探索页失败测试基线"
```

### Task 2: 实现力导向图谱页面（GREEN）

**Files:**
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx`
- Test: `frontend/src/tests/pages/skill-graph.test.tsx`

- [ ] **Step 1: 添加图数据映射与统计逻辑**

```ts
const graphData = useMemo(() => {
  const nodes = [{ id: 'user', name: user?.username ?? '用户', kind: 'user' as const }, ...skills.map((s, i) => ({ id: `skill-${i}`, name: s, kind: 'skill' as const }))];
  const links = skills.map((_, i) => ({ source: 'user', target: `skill-${i}` }));
  return { nodes, links };
}, [skills, user?.username]);
```

- [ ] **Step 2: 集成 `react-force-graph-2d` 与交互状态（hover/select/reset）**

```tsx
<ForceGraph2D
  ref={graphRef}
  graphData={graphData}
  onNodeHover={(node) => setHoverNode((node as GraphNode | null)?.name ?? '')}
  nodeRelSize={6}
  cooldownTicks={120}
/>
```

- [ ] **Step 3: 增加“重置视图”按钮并绑定 `zoomToFit`**

```tsx
<button onClick={handleResetView}>重置视图</button>
```

- [ ] **Step 4: 更新右侧状态卡为节点/连线/当前聚焦节点展示**

```tsx
<p>节点数：{graphData.nodes.length}</p>
<p>连线数：{graphData.links.length}</p>
<p>当前聚焦节点：{hoverNode || '无'}</p>
```

- [ ] **Step 5: 运行能力图谱页测试并修复直到通过**

Run: `cd frontend && npm run test:run -- src/tests/pages/skill-graph.test.tsx`
Expected: PASS

- [ ] **Step 6: 提交实现**

```bash
git add frontend/src/app/(user)/skill-graph/page.tsx frontend/src/tests/pages/skill-graph.test.tsx
git commit -m "feat(skill-graph): 升级可探索拖拽图谱交互"
```

### Task 3: 全量验证与浏览器联调

**Files:**
- Modify: `docs/superpowers/acceptance/2026-04-22-192200-user-skill-graph-exploration-acceptance.md`

- [ ] **Step 1: 运行前端构建**

Run: `cd frontend && npm run build`
Expected: build success

- [ ] **Step 2: 运行前端测试全量**

Run: `cd frontend && npm run test:run`
Expected: all tests pass

- [ ] **Step 3: 运行后端编译**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 4: 运行后端测试**

Run: `cd backend && mvn test`
Expected: BUILD SUCCESS

- [ ] **Step 5: 使用 `/web-access` + CDP 浏览器验证图谱页面交互**

Run: 打开 `/skill-graph` 页面，验证拖拽、缩放、平移、重置按钮可用。
Expected: 交互正常、无明显报错、主容器在桌面与移动宽度下可用。

- [ ] **Step 6: 更新 AC 状态并提交**

```bash
git add docs/superpowers/acceptance/2026-04-22-192200-user-skill-graph-exploration-acceptance.md
git commit -m "docs(skill-graph): 更新图谱探索升级验收状态"
```
