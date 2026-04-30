# 前端 Mock 壳重建与真实认证接入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将前端重构为“真实登录注册 + 用户端/企业端 mock 页面 + 无移动端 rewrite”的单一 Next.js 实现。

**Architecture:** 保留当前公开 URL 和 auth store，认证页继续对接现有 `authApi`；用户端和企业端业务页迁移到独立 `features/mock-*` 域并只读取本地 mock 数据；迁移时直接复用用户提供原型页面的样式、UI 和响应式结构，只做 Next 路由与数据接线适配；当前项目旧的移动端目录、rewrite 逻辑与相关测试统一移除。实现顺序遵循 TDD：先写失败测试，再做最小实现过绿，最后只做必要的路由与结构整理，不做视觉改造。

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Vitest, Testing Library, Zustand

---

### Task 1: 认证页真实对接与角色分流

**Files:**
- Create: `frontend/tests/pages/login.test.tsx`
- Modify: `frontend/tests/pages/register.test.tsx`
- Modify: `frontend/src/app/login/page.tsx`
- Modify: `frontend/src/app/register/page.tsx`
- Modify: `frontend/src/lib/auth/login-role.ts`

- [ ] **Step 1: 写失败测试，锁定登录页邮箱登录和角色分流**

```tsx
it('submits email/password and routes person to user home', async () => {
  mockLogin.mockResolvedValueOnce({
    accessToken: 'token',
    refreshToken: 'refresh',
    expiresIn: 3600,
    userType: 'PERSON',
    userId: 1,
  });

  render(<LoginPage />);
  await user.type(screen.getByPlaceholderText('请输入邮箱地址'), 'user@example.com');
  await user.type(screen.getByPlaceholderText('请输入密码'), 'Password123');
  await user.click(screen.getByRole('button', { name: '立即登录' }));

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith({
      username: 'user@example.com',
      password: 'Password123',
    });
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});

it('submits email/password and routes company to enterprise dashboard', async () => {
  mockLogin.mockResolvedValueOnce({
    accessToken: 'token',
    refreshToken: 'refresh',
    expiresIn: 3600,
    userType: 'COMPANY',
    userId: 2,
  });

  render(<LoginPage />);
  await user.click(screen.getByRole('button', { name: '招聘者' }));
  await user.type(screen.getByPlaceholderText('请输入邮箱地址'), 'hr@example.com');
  await user.type(screen.getByPlaceholderText('请输入密码'), 'Password123');
  await user.click(screen.getByRole('button', { name: '立即登录' }));

  await waitFor(() => {
    expect(mockPush).toHaveBeenCalledWith('/enterprise/dashboard');
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- frontend/tests/pages/login.test.tsx frontend/tests/pages/register.test.tsx`

Expected: `login.test.tsx` 因文件不存在或断言失败而报红；`register.test.tsx` 中与邮箱验证码或角色分流相关的新断言未通过。

- [ ] **Step 3: 做最小实现，让登录注册只按真实后端能力工作**

```tsx
// login/page.tsx
const [email, setEmail] = useState(DEV_ACCOUNTS.jobseeker.username);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const response = await authApi.login({ username: email, password });
  const decision = resolveLoginRoleDecision(activeRole, response.userType);
  if (!decision.allowed) {
    setError(decision.errorMessage ?? '账号角色与当前登录入口不匹配');
    return;
  }
  // 按 decision.authDomain 写入对应 auth store，再按 redirectPath 跳转
};

// register/page.tsx
await authApi.sendVerifyCode(email, 'register');
response = role === 'jobseeker'
  ? await authApi.personRegister({ username: email, password, verifyCode })
  : await authApi.companyRegister({
      username: email,
      password,
      verifyCode,
      companyName,
      unifiedSocialCreditCode,
    });
```

- [ ] **Step 4: 运行测试并确认转绿**

Run: `npm run test:run -- frontend/tests/pages/login.test.tsx frontend/tests/pages/register.test.tsx`

Expected: 新增登录测试和更新后的注册测试全部通过。

- [ ] **Step 5: 提交本批次**

```bash
git add frontend/tests/pages/login.test.tsx frontend/tests/pages/register.test.tsx frontend/src/app/login/page.tsx frontend/src/app/register/page.tsx frontend/src/lib/auth/login-role.ts
git commit -m "feat: 完成邮箱认证页真实对接"
```

### Task 2: 移动端目录与 rewrite 链路移除

**Files:**
- Create: `frontend/tests/pages/mobile-removal.test.ts`
- Delete: `frontend/src/app/mobile-user`
- Delete: `frontend/src/app/mobile-enterprise`
- Delete: `frontend/src/lib/device-routing.ts`
- Delete: `frontend/middleware.ts`
- Delete: `frontend/src/proxy.ts`
- Delete: `frontend/src/tests/app/mobile-user-page-regressions.test.tsx`
- Delete: `frontend/src/tests/app/mobile-user-shell.test.tsx`
- Delete: `frontend/src/tests/app/mobile-user-structure.test.ts`
- Delete: `frontend/src/tests/app/mobile-user-theme.test.tsx`
- Delete: `frontend/src/tests/app/mobile-enterprise-dashboard-page.test.tsx`
- Delete: `frontend/src/tests/app/mobile-enterprise-recommendations-page.test.tsx`
- Delete: `frontend/src/tests/app/mobile-enterprise-shell.test.tsx`
- Delete: `frontend/src/tests/app/mobile-enterprise-structure.test.ts`
- Delete: `frontend/src/tests/app/mobile-enterprise-team-page.test.tsx`
- Delete: `frontend/src/tests/lib/device-routing.test.ts`
- Delete: `frontend/tests/pages/mobile-user-login.test.tsx`
- Delete: `frontend/tests/pages/mobile-user-register.test.tsx`

- [ ] **Step 1: 写失败测试，锁定移动端目录和 rewrite 必须消失**

```ts
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

describe('mobile removal', () => {
  it('removes internal mobile app directories and rewrite entrypoints', () => {
    expect(existsSync(join(root, 'src/app/mobile-user'))).toBe(false);
    expect(existsSync(join(root, 'src/app/mobile-enterprise'))).toBe(false);
    expect(existsSync(join(root, 'src/lib/device-routing.ts'))).toBe(false);
    expect(existsSync(join(root, 'middleware.ts'))).toBe(false);
    expect(existsSync(join(root, 'src/proxy.ts'))).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- frontend/tests/pages/mobile-removal.test.ts`

Expected: 断言失败，显示上述目录或文件仍存在。

- [ ] **Step 3: 删除移动端实现、rewrite 文件和关联测试**

```text
remove frontend/src/app/mobile-user/**
remove frontend/src/app/mobile-enterprise/**
remove frontend/src/lib/device-routing.ts
remove frontend/middleware.ts
remove frontend/src/proxy.ts
remove all mobile-* tests and device-routing tests
```

- [ ] **Step 4: 运行测试并确认转绿**

Run: `npm run test:run -- frontend/tests/pages/mobile-removal.test.ts`

Expected: `mobile-removal.test.ts` 通过，且不存在对移动端目录的导入报错。

- [ ] **Step 5: 提交本批次**

```bash
git add frontend/tests/pages/mobile-removal.test.ts frontend/src/app frontend/src/lib frontend/tests/pages frontend/src/tests
git commit -m "refactor: 删除前端移动端路由与重写逻辑"
```

### Task 3: 用户端 mock feature 迁移

**Files:**
- Create: `frontend/src/features/mock-user/data/mock-user-data.ts`
- Create: `frontend/src/features/mock-user/data/mock-user-types.ts`
- Create: `frontend/src/features/mock-user/components/MockUserNavbar.tsx`
- Create: `frontend/src/features/mock-user/pages/HomePage.tsx`
- Create: `frontend/src/features/mock-user/pages/JobListPage.tsx`
- Create: `frontend/src/features/mock-user/pages/JobDetailPage.tsx`
- Create: `frontend/src/features/mock-user/pages/CompanyListPage.tsx`
- Create: `frontend/src/features/mock-user/pages/CompanyDetailPage.tsx`
- Create: `frontend/src/features/mock-user/pages/ProfilePage.tsx`
- Create: `frontend/src/features/mock-user/pages/ResumeManagePage.tsx`
- Create: `frontend/src/features/mock-user/pages/ResumeUploadPage.tsx`
- Create: `frontend/src/features/mock-user/pages/ApplicationsPage.tsx`
- Create: `frontend/src/features/mock-user/pages/NotificationsPage.tsx`
- Create: `frontend/src/features/mock-user/pages/SkillGraphPage.tsx`
- Create: `frontend/src/features/mock-user/pages/PersonalInfoPage.tsx`
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/app/(user)/layout.tsx`
- Modify: `frontend/src/app/(user)/jobs/page.tsx`
- Modify: `frontend/src/app/(user)/jobs/[id]/page.tsx`
- Modify: `frontend/src/app/(user)/companies/page.tsx`
- Modify: `frontend/src/app/(user)/companies/[id]/page.tsx`
- Modify: `frontend/src/app/(user)/profile/page.tsx`
- Modify: `frontend/src/app/(user)/resume/manage/page.tsx`
- Modify: `frontend/src/app/(user)/resume/upload/page.tsx`
- Modify: `frontend/src/app/(user)/applications/page.tsx`
- Modify: `frontend/src/app/(user)/notifications/page.tsx`
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx`
- Create: `frontend/src/app/(user)/personal-info/page.tsx`
- Modify: `frontend/tests/pages/page.test.tsx`
- Modify: `frontend/tests/pages/jobs.test.tsx`
- Modify: `frontend/tests/pages/company-detail.test.tsx`
- Modify: `frontend/tests/pages/profile.test.tsx`
- Modify: `frontend/tests/pages/resume-manage.test.tsx`
- Modify: `frontend/tests/pages/skill-graph.test.tsx`

- [ ] **Step 1: 写失败测试，锁定用户端首页与关键 mock 页渲染**

```tsx
it('renders mock home hero instead of real api overview', async () => {
  render(<HomePage />);
  expect(await screen.findByText(/连接卓越|图谱智聘领航未来/)).toBeInTheDocument();
});

it('renders mock skill graph page without calling real graph api', async () => {
  render(<SkillGraphPage />);
  expect(screen.getByText(/我的图谱|认知导视体系/)).toBeInTheDocument();
  expect(mockGetGraph).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- frontend/tests/pages/page.test.tsx frontend/tests/pages/profile.test.tsx frontend/tests/pages/skill-graph.test.tsx`

Expected: 旧页面仍依赖真实 API 或旧布局，关键文案断言失败。

- [ ] **Step 3: 创建 mock-user feature 并把用户端路由切到本地 mock 页面**

```tsx
// src/app/page.tsx
import HomePage from '@/features/mock-user/pages/HomePage';
export default function Page() {
  return <HomePage />;
}

// src/app/(user)/skill-graph/page.tsx
import SkillGraphPage from '@/features/mock-user/pages/SkillGraphPage';
export default function Page() {
  return <SkillGraphPage />;
}

// src/app/(user)/layout.tsx
import MockUserNavbar from '@/features/mock-user/components/MockUserNavbar';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-background">
      <MockUserNavbar />
      {children}
    </div>
  );
}
```

约束：

- 从原型拷贝页面时保持原 JSX 结构和 className 不变
- 不重写样式，不自行调整间距、颜色、排版和响应式断点
- 仅替换 `Link`、`useNavigate`、`useParams`、`useLocation` 等路由 API

- [ ] **Step 4: 运行用户端相关测试并确认转绿**

Run: `npm run test:run -- frontend/tests/pages/page.test.tsx frontend/tests/pages/jobs.test.tsx frontend/tests/pages/company-detail.test.tsx frontend/tests/pages/profile.test.tsx frontend/tests/pages/resume-manage.test.tsx frontend/tests/pages/skill-graph.test.tsx`

Expected: 用户端关键页面测试通过，且不再依赖真实业务数据接口。

- [ ] **Step 5: 提交本批次**

```bash
git add frontend/src/features/mock-user frontend/src/app frontend/tests/pages
git commit -m "feat: 迁移用户端 mock 页面壳"
```

### Task 4: 企业端 mock feature 迁移与前端验证

**Files:**
- Create: `frontend/src/features/mock-enterprise/data/mock-enterprise-data.ts`
- Create: `frontend/src/features/mock-enterprise/components/MockEnterpriseTopNav.tsx`
- Create: `frontend/src/features/mock-enterprise/pages/DashboardPage.tsx`
- Create: `frontend/src/features/mock-enterprise/pages/JobsPage.tsx`
- Create: `frontend/src/features/mock-enterprise/pages/JobCreatePage.tsx`
- Create: `frontend/src/features/mock-enterprise/pages/JobDetailPage.tsx`
- Create: `frontend/src/features/mock-enterprise/pages/JobEditPage.tsx`
- Create: `frontend/src/features/mock-enterprise/pages/RecommendationsPage.tsx`
- Create: `frontend/src/features/mock-enterprise/pages/CandidateDetailPage.tsx`
- Create: `frontend/src/features/mock-enterprise/pages/EmployeesPage.tsx`
- Create: `frontend/src/features/mock-enterprise/pages/NotificationsPage.tsx`
- Modify: `frontend/src/app/enterprise/layout.tsx`
- Modify: `frontend/src/app/enterprise/dashboard/page.tsx`
- Modify: `frontend/src/app/enterprise/jobs/page.tsx`
- Modify: `frontend/src/app/enterprise/jobs/new/page.tsx`
- Modify: `frontend/src/app/enterprise/jobs/[id]/page.tsx`
- Modify: `frontend/src/app/enterprise/jobs/[id]/edit/page.tsx`
- Modify: `frontend/src/app/enterprise/recommendations/page.tsx`
- Modify: `frontend/src/app/enterprise/employees/page.tsx`
- Modify: `frontend/src/app/enterprise/notifications/page.tsx`
- Create: `frontend/src/app/enterprise/candidates/[id]/page.tsx`
- Modify: `frontend/tests/pages/enterprise/dashboard.test.tsx`
- Modify: `frontend/tests/pages/enterprise/jobs.test.tsx`
- Modify: `frontend/tests/pages/enterprise/jobs-new.test.tsx`
- Modify: `frontend/tests/pages/enterprise/jobs-id.test.tsx`
- Modify: `frontend/tests/pages/enterprise/jobs-id-edit.test.tsx`
- Modify: `frontend/tests/pages/enterprise/employees.test.tsx`

- [ ] **Step 1: 写失败测试，锁定企业端 dashboard / employees / notifications 的 mock 渲染**

```tsx
it('renders mock enterprise dashboard copy', async () => {
  render(<EnterpriseDashboardPage />);
  expect(await screen.findByText(/欢迎回来，HR|这是您今天的招聘数据概览/)).toBeInTheDocument();
});

it('renders team page at /enterprise/employees', async () => {
  render(<EmployeesPage />);
  expect(screen.getByText(/团队管理|员工列表/)).toBeInTheDocument();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- frontend/tests/pages/enterprise/dashboard.test.tsx frontend/tests/pages/enterprise/employees.test.tsx`

Expected: 旧页面仍依赖真实接口，关键 mock 文案断言失败。

- [ ] **Step 3: 创建 mock-enterprise feature 并把企业端路由切到本地 mock 页面，同时保留鉴权守卫**

```tsx
// src/app/enterprise/layout.tsx
import EnterpriseAuthGuard from '@/components/enterprise/EnterpriseAuthGuard';
import MockEnterpriseTopNav from '@/features/mock-enterprise/components/MockEnterpriseTopNav';

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  return (
    <EnterpriseAuthGuard>
      <div className="min-h-screen bg-background">
        <MockEnterpriseTopNav />
        {children}
      </div>
    </EnterpriseAuthGuard>
  );
}

// src/app/enterprise/employees/page.tsx
import EmployeesPage from '@/features/mock-enterprise/pages/EmployeesPage';
export default function Page() {
  return <EmployeesPage />;
}
```

约束：

- 企业端原型页面中的 `TopNav`、`BottomNav`、页面容器和 CSS 结构按原样迁移
- 不改原型 UI，只改 Next 路由适配和 mock 数据装配
- 新增 `/enterprise/candidates/[id]` 时沿用原型候选人详情页的原始样式

- [ ] **Step 4: 运行企业端测试、全量前端测试和前端构建**

Run: `npm run test:run`

Expected: 所有前端测试通过。

Run: `npm run build`

Expected: Next.js 生产构建成功，退出码为 0。

- [ ] **Step 5: 浏览器验收并提交本批次**

Run: 使用 CDP 打开 `/login`、`/register`、`/`、`/enterprise/dashboard`

Expected: 登录页和注册页可正常输入；用户端首页和企业端工作台均渲染新的 mock 页面结构。

```bash
git add frontend/src/features/mock-enterprise frontend/src/app/enterprise frontend/tests/pages
git commit -m "feat: 完成企业端 mock 页面与前端验证"
```
