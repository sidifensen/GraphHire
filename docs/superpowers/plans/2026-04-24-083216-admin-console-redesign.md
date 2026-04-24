# 管理端全页面重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将管理端登录页与 5 个业务页按原型视觉体系重写，同时保持现有 API 交互行为不回归。  
**Architecture:** 提炼统一壳组件与通用展示组件，页面层只保留业务状态与 API 操作；通过 TDD 先更新断言再重写生产代码，确保功能行为可验证。  
**Tech Stack:** Next.js 16、React 19、TypeScript、TailwindCSS、Vitest、Testing Library、Recharts

---

### Task 1: 更新管理端页面测试（RED）

**Files:**
- Modify: `frontend/tests/pages/admin-login.test.tsx`
- Modify: `frontend/tests/pages/admin-dashboard.test.tsx`
- Modify: `frontend/tests/pages/admin-enterprise-review.test.tsx`
- Modify: `frontend/tests/pages/admin-users.test.tsx`
- Modify: `frontend/tests/pages/admin-skill-tags.test.tsx`
- Modify: `frontend/tests/pages/admin-task-monitor.test.tsx`

- [ ] **Step 1: 调整测试断言为重构后语义**
```tsx
expect(screen.getByText('概览数据')).toBeInTheDocument();
expect(screen.getByRole('button', { name: '登 录' })).toBeInTheDocument();
```

- [ ] **Step 2: 运行页面测试并确认失败**
Run: `npm run test:run -- tests/pages/admin-login.test.tsx tests/pages/admin-dashboard.test.tsx tests/pages/admin-enterprise-review.test.tsx tests/pages/admin-users.test.tsx tests/pages/admin-skill-tags.test.tsx tests/pages/admin-task-monitor.test.tsx`  
Expected: 至少一个用例失败（当前实现未满足新文案/新结构）

- [ ] **Step 3: 提交测试基线变更**
```bash
git add frontend/tests/pages/admin-*.test.tsx
git commit -m "test(admin): 更新管理端重构前置测试断言"
```

### Task 2: 新增管理端通用视觉组件（GREEN）

**Files:**
- Create: `frontend/src/components/admin/AdminShell.tsx`
- Create: `frontend/src/components/admin/AdminTopbar.tsx`
- Create: `frontend/src/components/admin/AdminDataTable.tsx`
- Create: `frontend/src/components/admin/AdminStatCard.tsx`

- [ ] **Step 1: 编写最小可用通用组件实现**
```tsx
export function AdminShell({ sidebarActive, title, children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar activeItem={sidebarActive} />
      <div className="ml-64 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: 运行相关测试确认无编译错误**
Run: `npm run test:run -- tests/pages/admin-dashboard.test.tsx`  
Expected: 测试可执行，失败仅来自页面断言而非组件导入错误

- [ ] **Step 3: 提交通用组件**
```bash
git add frontend/src/components/admin/AdminShell.tsx frontend/src/components/admin/AdminTopbar.tsx frontend/src/components/admin/AdminDataTable.tsx frontend/src/components/admin/AdminStatCard.tsx
git commit -m "feat(admin): 新增管理端重构通用壳与展示组件"
```

### Task 3: 重写登录页（GREEN）

**Files:**
- Modify: `frontend/src/app/admin/login/page.tsx`
- Test: `frontend/tests/pages/admin-login.test.tsx`

- [ ] **Step 1: 保留登录业务流程，仅替换布局与文案**
```tsx
const response = await adminApi.login({ username, password });
adminAuthStore.getState().setAuth(...);
router.push('/admin/dashboard');
```

- [ ] **Step 2: 运行登录页测试**
Run: `npm run test:run -- tests/pages/admin-login.test.tsx`  
Expected: PASS

- [ ] **Step 3: 提交登录页改造**
```bash
git add frontend/src/app/admin/login/page.tsx frontend/tests/pages/admin-login.test.tsx
git commit -m "feat(admin): 重写管理端登录页视觉与交互布局"
```

### Task 4: 重写仪表盘与企业审核页（GREEN）

**Files:**
- Modify: `frontend/src/app/admin/dashboard/page.tsx`
- Modify: `frontend/src/app/admin/enterprise-review/page.tsx`
- Test: `frontend/tests/pages/admin-dashboard.test.tsx`
- Test: `frontend/tests/pages/admin-enterprise-review.test.tsx`

- [ ] **Step 1: 仪表盘改为公告+KPI+图表+待办结构并保留 API 加载**
```tsx
const data = await adminApi.getDashboardStats();
setStats(data);
```

- [ ] **Step 2: 企业审核改为统计卡+筛选+表格结构并保留批量操作**
```tsx
await adminApi.batchApproveCompanies({ ids: selected });
await adminApi.batchRejectCompanies({ ids: selected, reason });
```

- [ ] **Step 3: 运行两页测试**
Run: `npm run test:run -- tests/pages/admin-dashboard.test.tsx tests/pages/admin-enterprise-review.test.tsx`  
Expected: PASS

- [ ] **Step 4: 提交页面改造**
```bash
git add frontend/src/app/admin/dashboard/page.tsx frontend/src/app/admin/enterprise-review/page.tsx frontend/tests/pages/admin-dashboard.test.tsx frontend/tests/pages/admin-enterprise-review.test.tsx
git commit -m "feat(admin): 重写仪表盘与企业审核页面"
```

### Task 5: 重写用户管理页（GREEN）

**Files:**
- Modify: `frontend/src/app/admin/users/page.tsx`
- Test: `frontend/tests/pages/admin-users.test.tsx`

- [ ] **Step 1: 保留用户筛选/批量禁用/详情弹窗 API 逻辑，重写页面视觉**
```tsx
const res = await adminApi.getUserList(...);
const detail = await adminApi.getUserDetail(userId);
await adminApi.batchDisableUsers({ userIds: selected });
```

- [ ] **Step 2: 运行用户页测试**
Run: `npm run test:run -- tests/pages/admin-users.test.tsx`  
Expected: PASS

- [ ] **Step 3: 提交用户页改造**
```bash
git add frontend/src/app/admin/users/page.tsx frontend/tests/pages/admin-users.test.tsx
git commit -m "feat(admin): 重写用户管理页面并保留详情能力"
```

### Task 6: 重写标签治理与任务监控页（GREEN）

**Files:**
- Modify: `frontend/src/app/admin/skill-tags/page.tsx`
- Modify: `frontend/src/app/admin/task-monitor/page.tsx`
- Test: `frontend/tests/pages/admin-skill-tags.test.tsx`
- Test: `frontend/tests/pages/admin-task-monitor.test.tsx`

- [ ] **Step 1: 标签治理保留筛选与分页请求逻辑**
```tsx
const res = await adminApi.getSkillList({ keyword, category, page, pageSize });
```

- [ ] **Step 2: 任务监控保留刷新、单重试、批量重试**
```tsx
await adminApi.retryTask(id);
await adminApi.batchRetryTasks({ taskIds: selected });
```

- [ ] **Step 3: 运行两页测试**
Run: `npm run test:run -- tests/pages/admin-skill-tags.test.tsx tests/pages/admin-task-monitor.test.tsx`  
Expected: PASS

- [ ] **Step 4: 提交页面改造**
```bash
git add frontend/src/app/admin/skill-tags/page.tsx frontend/src/app/admin/task-monitor/page.tsx frontend/tests/pages/admin-skill-tags.test.tsx frontend/tests/pages/admin-task-monitor.test.tsx
git commit -m "feat(admin): 重写标签治理与任务监控页面"
```

### Task 7: 全量验证与浏览器验收

**Files:**
- Modify: `frontend/src/styles/globals.css`（若重构需要补充共享样式）
- Modify: `RELEASE-NOTES.md`（记录本次重构）

- [ ] **Step 1: 前端构建与测试**
Run: `npm run build && npm run test:run`  
Expected: 全部通过

- [ ] **Step 2: 后端编译与测试**
Run: `mvn compile && mvn test`  
Expected: 全部通过

- [ ] **Step 3: 使用 CDP 验证 6 个管理端页面可访问**
Run: 通过 `web-access` / CDP 打开并检查 `/admin/login`、`/admin/dashboard`、`/admin/enterprise-review`、`/admin/users`、`/admin/skill-tags`、`/admin/task-monitor`  
Expected: 每页关键标题可见，无致命渲染报错

- [ ] **Step 4: 汇总变更并提交**
```bash
git add .
git commit -m "feat(admin): 重构管理端六个页面并统一视觉体系"
```

