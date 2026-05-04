# 用户端登录注册统一页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `/login` 与 `/register` 收敛为同一套认证页面框架，并在右侧表单区完成登录/注册切换。

**Architecture:** 新增共享客户端组件承载统一布局与模式切换；登录和注册 page 仅作为入口壳传入默认模式。保留原有登录/注册 API 行为与角色分支逻辑，通过测试先行保障行为不回归。

**Tech Stack:** Next.js App Router、React 19、TypeScript、Vitest、Testing Library、framer-motion、Tailwind CSS

---

### Task 1: 为统一页切换补充失败测试（RED）

**Files:**
- Modify: `frontend/src/tests/pages/login.test.tsx`
- Modify: `frontend/src/tests/pages/register.test.tsx`
- Modify: `frontend/tests/pages/login.test.tsx`
- Modify: `frontend/tests/pages/register.test.tsx`

- [ ] **Step 1: 新增登录页切换到注册表单断言**

```tsx
await user.click(screen.getByRole('button', { name: '注册' }));
expect(screen.getByRole('button', { name: '创建账号' })).toBeInTheDocument();
```

- [ ] **Step 2: 新增注册页切换到登录表单断言**

```tsx
await user.click(screen.getByRole('button', { name: '登录' }));
expect(screen.getByRole('button', { name: '立即登录' })).toBeInTheDocument();
```

- [ ] **Step 3: 运行用例并确认失败**

Run: `npm run test:run -- src/tests/pages/login.test.tsx src/tests/pages/register.test.tsx tests/pages/login.test.tsx tests/pages/register.test.tsx`
Expected: FAIL，提示缺少统一页模式切换按钮或对应表单元素。

### Task 2: 实现统一认证页并复用原认证逻辑（GREEN）

**Files:**
- Create: `frontend/src/components/auth/AuthUnifiedPage.tsx`
- Modify: `frontend/src/app/login/page.tsx`
- Modify: `frontend/src/app/register/page.tsx`

- [ ] **Step 1: 新建统一页组件与模式枚举**

```tsx
export type AuthMode = 'login' | 'register';
export default function AuthUnifiedPage({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
}
```

- [ ] **Step 2: 实现顶部“登录/注册”模式切换并联动路由**

```tsx
const switchMode = (nextMode: AuthMode) => {
  setMode(nextMode);
  router.push(nextMode === 'login' ? '/login' : '/register');
};
```

- [ ] **Step 3: 迁移并保留登录逻辑**

```tsx
if (mode === 'login') {
  const response = await authApi.login({ username: email, password });
  const decision = resolveLoginRoleDecision(activeRole, response.userType);
}
```

- [ ] **Step 4: 迁移并保留注册逻辑**

```tsx
if (registerRole === 'jobseeker') {
  await authApi.personRegister(data);
} else {
  await authApi.companyRegister(data);
}
```

- [ ] **Step 5: 两个路由页改为统一组件入口**

```tsx
// login/page.tsx
return <AuthUnifiedPage initialMode="login" />;

// register/page.tsx
return <AuthUnifiedPage initialMode="register" />;
```

- [ ] **Step 6: 运行认证相关测试并确认通过**

Run: `npm run test:run -- src/tests/pages/login.test.tsx src/tests/pages/register.test.tsx tests/pages/login.test.tsx tests/pages/register.test.tsx`
Expected: PASS

### Task 3: 全量前端验证与收尾

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 运行前端测试全集**

Run: `npm run test:run`
Expected: PASS

- [ ] **Step 2: 运行前端构建验证**

Run: `npm run build`
Expected: Build 成功，退出码 0。

- [ ] **Step 3: 更新发布记录并提交**

```bash
git add docs/superpowers/specs/2026-05-04-143053-user-auth-unified-design.md docs/superpowers/acceptance/2026-05-04-143053-user-auth-unified-acceptance.md docs/superpowers/plans/2026-05-04-143053-user-auth-unified.md frontend/src/components/auth/AuthUnifiedPage.tsx frontend/src/app/login/page.tsx frontend/src/app/register/page.tsx frontend/src/tests/pages/login.test.tsx frontend/src/tests/pages/register.test.tsx frontend/tests/pages/login.test.tsx frontend/tests/pages/register.test.tsx RELEASE-NOTES.md
git commit -m "feat: 用户端登录注册统一为同页切换表单"
```

Expected: 提交成功，且 `RELEASE-NOTES.md` 已记录本次变更。
