# 用户端“我的”桌面侧栏工作台改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改业务逻辑和移动端行为的前提下，将 `/profile`、`/personal-info`、`/resume/manage`、`/applications`、`/skill-graph` 统一为桌面端“左侧菜单 + 右侧内容”的工作台结构。

**Architecture:** 新增一个用户端桌面工作台壳层（侧栏组件）并在 5 个页面引入；页面内部仅做桌面端结构与样式重排。原有 API 调用、状态管理、按钮语义、移动端容器保持不变。测试层先新增失败用例校验侧栏与关键布局，再最小实现通过并回归。

**Tech Stack:** Next.js 16、React 19、Tailwind CSS、Vitest、Testing Library。

---

### Task 1: 新增桌面工作台侧栏组件（AC-001, AC-002, AC-005）

**Files:**
- Create: `frontend/src/app/(user)/_components/UserWorkbenchSidebar.tsx`
- Test: `frontend/src/tests/components/user-workbench-sidebar.test.tsx`

- [ ] **Step 1: 编写失败测试（侧栏菜单与高亮）**

```tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import UserWorkbenchSidebar from '@/app/(user)/_components/UserWorkbenchSidebar';

let pathname = '/personal-info';

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

describe('UserWorkbenchSidebar', () => {
  it('renders all menu entries and marks active item', () => {
    render(<UserWorkbenchSidebar />);

    expect(screen.getByRole('link', { name: '个人资料' })).toHaveAttribute('href', '/personal-info');
    expect(screen.getByRole('link', { name: '简历管理' })).toHaveAttribute('href', '/resume/manage');
    expect(screen.getByRole('link', { name: '投递记录' })).toHaveAttribute('href', '/applications');
    expect(screen.getByRole('link', { name: '我的图谱' })).toHaveAttribute('href', '/skill-graph');
    expect(screen.getByRole('link', { name: '账号设置' })).toHaveAttribute('href', '#');

    expect(screen.getByRole('link', { name: '个人资料' })).toHaveAttribute('aria-current', 'page');
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/tests/components/user-workbench-sidebar.test.tsx`
Expected: FAIL，提示组件文件不存在或断言失败。

- [ ] **Step 3: 编写最小实现**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU_ITEMS = [
  { label: '个人资料', href: '/personal-info' },
  { label: '简历管理', href: '/resume/manage' },
  { label: '投递记录', href: '/applications' },
  { label: '我的图谱', href: '/skill-graph' },
  { label: '账号设置', href: '#' },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '#') {
    return false;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function UserWorkbenchSidebar() {
  const pathname = usePathname() ?? '/';

  return (
    <aside className="hidden lg:block lg:w-64 lg:shrink-0">
      <nav aria-label="我的页面菜单" className="sticky top-24 rounded-2xl border border-surface-mid bg-surface-lowest">
        <ul className="divide-y divide-surface-mid">
          {MENU_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`block px-4 py-3 text-sm font-semibold transition-colors ${active ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-low'}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm run test:run -- src/tests/components/user-workbench-sidebar.test.tsx`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add frontend/src/app/(user)/_components/UserWorkbenchSidebar.tsx frontend/src/tests/components/user-workbench-sidebar.test.tsx
git commit -m "feat: 新增用户端桌面工作台侧栏组件"
```

### Task 2: `/profile` 引入侧栏并移除菜单宫格（AC-001, AC-006, AC-007）

**Files:**
- Modify: `frontend/src/app/(user)/profile/page.tsx`
- Test: `frontend/src/tests/pages/user-profile-links.test.tsx`

- [ ] **Step 1: 编写失败测试（桌面侧栏存在，旧菜单宫格移除）**

```tsx
it('shows desktop workbench sidebar and removes old menu grid', async () => {
  render(
    <ThemeProvider>
      <ProfilePage />
    </ThemeProvider>,
  );

  expect(screen.getByRole('navigation', { name: '我的页面菜单' })).toBeInTheDocument();
  expect(screen.queryAllByRole('link', { name: '个人资料' }).length).toBe(1);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/tests/pages/user-profile-links.test.tsx`
Expected: FAIL（当前无侧栏且同名入口重复）。

- [ ] **Step 3: 最小实现改造 `/profile` 布局**

```tsx
// 关键改造点
// 1) 引入 <UserWorkbenchSidebar />
// 2) 桌面端容器改为 lg:flex，左侧侧栏 + 右侧内容
// 3) 移除原 menuItems 宫格 section
// 4) 保留夜间模式、退出登录、统计和求职意向
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm run test:run -- src/tests/pages/user-profile-links.test.tsx`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add frontend/src/app/(user)/profile/page.tsx frontend/src/tests/pages/user-profile-links.test.tsx
git commit -m "refactor: 调整我的页桌面布局为侧栏工作台"
```

### Task 3: `personal-info` 引入侧栏与桌面分区表单（AC-002, AC-007）

**Files:**
- Modify: `frontend/src/app/(user)/personal-info/page.tsx`
- Modify: `frontend/src/tests/pages/user-personal-info-page.test.tsx`

- [ ] **Step 1: 编写失败测试（侧栏出现且核心表单可见）**

```tsx
it('renders workbench sidebar on desktop layout', async () => {
  render(<PersonalInfoPage />);
  await waitFor(() => expect(getProfileMock).toHaveBeenCalledTimes(1));

  expect(screen.getByRole('navigation', { name: '我的页面菜单' })).toBeInTheDocument();
  expect(screen.getByText('基本信息')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '保存修改' })).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/tests/pages/user-personal-info-page.test.tsx`
Expected: FAIL（当前无侧栏）。

- [ ] **Step 3: 最小实现改造页面外层与桌面分区样式**

```tsx
// 关键改造点
// 1) TopNav 下主容器改为 lg:flex
// 2) 左侧放 UserWorkbenchSidebar
// 3) 右侧表单区去重卡片化，改分区和分割线
// 4) 提交、上传逻辑不变
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm run test:run -- src/tests/pages/user-personal-info-page.test.tsx`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add frontend/src/app/(user)/personal-info/page.tsx frontend/src/tests/pages/user-personal-info-page.test.tsx
git commit -m "refactor: 个人资料页接入桌面侧栏并优化分区布局"
```

### Task 4: `resume/manage` 改桌面行式列表并接入侧栏（AC-003, AC-007）

**Files:**
- Modify: `frontend/src/app/(user)/resume/_components/ResumeManageContent.tsx`
- Modify: `frontend/src/tests/pages/user-resume-manage-page.test.tsx`

- [ ] **Step 1: 编写失败测试（侧栏出现与列表行标记）**

```tsx
it('shows workbench sidebar and desktop resume rows', async () => {
  render(<ResumeManagePage />);
  await waitFor(() => expect(getMyResumesMock).toHaveBeenCalledTimes(1));

  expect(screen.getByRole('navigation', { name: '我的页面菜单' })).toBeInTheDocument();
  expect(screen.getAllByTestId('resume-row').length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/tests/pages/user-resume-manage-page.test.tsx`
Expected: FAIL（当前无侧栏，无 `resume-row` 标记）。

- [ ] **Step 3: 最小实现（布局接入 + 列表行结构）**

```tsx
// 关键改造点
// 1) 引入 UserWorkbenchSidebar
// 2) 桌面端 list 渲染改为纵向行（每行多列信息 + 操作）
// 3) 每条记录容器加 data-testid="resume-row"
// 4) 行为按钮 aria-label 保持不变
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm run test:run -- src/tests/pages/user-resume-manage-page.test.tsx`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add frontend/src/app/(user)/resume/_components/ResumeManageContent.tsx frontend/src/tests/pages/user-resume-manage-page.test.tsx
git commit -m "refactor: 简历管理页改为桌面侧栏与行式列表"
```

### Task 5: `applications` 改桌面行式记录并接入侧栏（AC-004, AC-007）

**Files:**
- Modify: `frontend/src/app/(user)/applications/page.tsx`
- Modify: `frontend/src/tests/pages/user-applications-page.test.tsx`

- [ ] **Step 1: 编写失败测试（侧栏与行记录标记）**

```tsx
it('shows workbench sidebar and application rows', async () => {
  render(<ApplicationsPage />);
  await waitFor(() => expect(getApplicationsMock).toHaveBeenCalledTimes(1));

  expect(screen.getByRole('navigation', { name: '我的页面菜单' })).toBeInTheDocument();
  expect(screen.getAllByTestId('application-row').length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/tests/pages/user-applications-page.test.tsx`
Expected: FAIL（当前无侧栏，无 `application-row` 标记）。

- [ ] **Step 3: 最小实现（布局接入 + 行式记录）**

```tsx
// 关键改造点
// 1) 引入 UserWorkbenchSidebar
// 2) 桌面端卡片网格改为行式记录
// 3) 每条记录加 data-testid="application-row"
// 4) tabs 和撤回逻辑保持不变
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm run test:run -- src/tests/pages/user-applications-page.test.tsx`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add frontend/src/app/(user)/applications/page.tsx frontend/src/tests/pages/user-applications-page.test.tsx
git commit -m "refactor: 投递记录页改为桌面侧栏与行式展示"
```

### Task 6: `skill-graph` 接入侧栏并扁平化右侧信息区（AC-005, AC-007）

**Files:**
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx`
- Create: `frontend/src/tests/pages/user-skill-graph-page.test.tsx`

- [ ] **Step 1: 编写失败测试（侧栏与图谱页面关键元素）**

```tsx
import { render, screen } from '@testing-library/react';
import SkillGraphPage from '@/app/(user)/skill-graph/page';

describe('User Skill Graph page', () => {
  it('renders sidebar and graph sections', () => {
    render(<SkillGraphPage />);
    expect(screen.getByRole('navigation', { name: '我的页面菜单' })).toBeInTheDocument();
    expect(screen.getByText('全景图谱')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重新生成分析视图' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/tests/pages/user-skill-graph-page.test.tsx`
Expected: FAIL（当前无侧栏测试）。

- [ ] **Step 3: 最小实现（侧栏接入 + 信息区样式扁平化）**

```tsx
// 关键改造点
// 1) 引入 UserWorkbenchSidebar
// 2) 外层改为 lg:flex
// 3) 右侧信息块减少重卡片视觉，保持文案与交互
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `npm run test:run -- src/tests/pages/user-skill-graph-page.test.tsx`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add frontend/src/app/(user)/skill-graph/page.tsx frontend/src/tests/pages/user-skill-graph-page.test.tsx
git commit -m "refactor: 我的图谱页接入桌面侧栏并扁平化信息区"
```

### Task 7: 全量验证与浏览器验收（AC-008, AC-009, AC-010）

**Files:**
- Modify (if needed): `docs/superpowers/acceptance/2026-04-30-231816-user-workbench-sidebar-acceptance.md`（仅当验收记录需补充）

- [ ] **Step 1: 前端构建验证**

Run: `cd frontend && npm run build`
Expected: 成功退出，Next 构建通过。

- [ ] **Step 2: 前端测试验证**

Run: `cd frontend && npm run test:run`
Expected: 全部测试通过。

- [ ] **Step 3: 后端编译验证**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS。

- [ ] **Step 4: 后端测试验证**

Run: `cd backend && mvn test`
Expected: BUILD SUCCESS。

- [ ] **Step 5: CDP 浏览器验收**

Run/Action: 启动前后端后，使用 chrome-devtools 打开以下页面并验证桌面端左栏与右侧内容：
- `/profile`
- `/personal-info`
- `/resume/manage`
- `/applications`
- `/skill-graph`

Expected: 5 页均满足“左栏菜单 + 右侧内容”，TopNav 保留，关键交互可达。

- [ ] **Step 6: 最终提交**

```bash
git add <all-modified-files>
git commit -m "refactor: 用户端我的相关页面桌面端改为侧栏工作台布局"
```
