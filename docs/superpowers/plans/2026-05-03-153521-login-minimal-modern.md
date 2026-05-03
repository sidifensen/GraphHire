# Login Minimal Modern Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变登录表单业务行为的前提下，将登录页升级为简约现代布局与视觉。

**Architecture:** 保持 `LoginPage` 现有登录逻辑与表单子树，仅在页面级新增布局壳层和品牌信息区，通过样式重组实现视觉升级。测试先增加布局断言（RED），再最小化实现（GREEN），最后执行回归验证。

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Vitest, Testing Library

---

### Task 1: 新增布局回归测试（AC-001, AC-002）

**Files:**
- Modify: `frontend/src/tests/pages/login.test.tsx`
- Test: `frontend/src/tests/pages/login.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
test('渲染简约现代布局壳层并保留登录表单输入框', () => {
  render(<LoginPage />);
  expect(screen.getByTestId('login-layout-shell')).toBeInTheDocument();
  expect(screen.getByTestId('login-brand-panel')).toBeInTheDocument();
  expect(screen.getByTestId('login-form-panel')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('请输入邮箱')).toHaveAttribute('type', 'email');
  expect(screen.getByPlaceholderText('请输入密码')).toHaveAttribute('type', 'password');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/tests/pages/login.test.tsx`  
Expected: FAIL，提示找不到 `login-layout-shell` 等测试标识

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/pages/login.test.tsx
git commit -m "test: 增加登录页简约布局壳层断言"
```

### Task 2: 实现简约现代布局（AC-001）

**Files:**
- Modify: `frontend/src/app/login/page.tsx`
- Test: `frontend/src/tests/pages/login.test.tsx`

- [ ] **Step 1: Write minimal implementation**

```tsx
<div data-testid="login-layout-shell">...
  <section data-testid="login-brand-panel">...</section>
  <main data-testid="login-form-panel">...</main>
</div>
```

约束：
- 仅重排外层结构和样式
- 原表单字段、按钮、切换、提交逻辑不改

- [ ] **Step 2: Run test to verify it passes**

Run: `npm run test:run -- src/tests/pages/login.test.tsx`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/login/page.tsx frontend/src/tests/pages/login.test.tsx
git commit -m "feat: 登录页升级为简约现代双栏布局"
```

### Task 3: 全量前端验证（AC-003, AC-004, AC-005）

**Files:**
- Verify only: `frontend/src/tests/pages/login.test.tsx`

- [ ] **Step 1: Run frontend build**

Run: `npm run build`  
Expected: exit code 0

- [ ] **Step 2: Run frontend tests**

Run: `npm run test:run`  
Expected: exit code 0

- [ ] **Step 3: Commit release note update**

```bash
git add RELEASE-NOTES.md
git commit -m "docs: 更新登录页视觉改造发布说明"
```
