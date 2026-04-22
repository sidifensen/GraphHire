# Login Role Switch Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为登录页“求职者/招聘者”切换增加 Framer Motion 标签滑块与表单过渡动画，且不改变现有业务行为。

**Architecture:** 在登录页组件中引入 Framer Motion。角色标签使用共享 `layoutId` 指示器做平滑切换，表单区域使用 `AnimatePresence` 的 keyed 容器做进入/退出过渡；动画由 `activeRole` 驱动，并兼容 `prefers-reduced-motion`。

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion, Vitest + Testing Library

---

### Task 1: 先写失败测试（TDD RED）

**Files:**
- Modify: `frontend/src/tests/pages/login.test.tsx`
- Test: `frontend/src/tests/pages/login.test.tsx`

- [ ] **Step 1: 新增激活动画指示器测试（失败）**

```tsx
import { within } from '@testing-library/react';

// 默认状态下指示器在“求职者”按钮内
expect(within(jobseekerButton).getByTestId('role-switch-indicator')).toBeInTheDocument();

// 切换后指示器在“招聘者”按钮内
expect(within(recruiterButton).getByTestId('role-switch-indicator')).toBeInTheDocument();
```

- [ ] **Step 2: 新增表单动画容器测试（失败）**

```tsx
const rolePanel = screen.getByTestId('login-role-panel');
expect(rolePanel).toHaveAttribute('data-role', 'jobseeker');
```

- [ ] **Step 3: 运行测试验证失败**

Run: `npm run test:run -- src/tests/pages/login.test.tsx`
Expected: FAIL（缺少 `role-switch-indicator` 与 `login-role-panel`）

### Task 2: 最小实现让测试转绿（TDD GREEN）

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/src/app/login/page.tsx`
- Test: `frontend/src/tests/pages/login.test.tsx`

- [ ] **Step 1: 引入 Framer Motion 依赖**

```bash
npm i framer-motion
```

- [ ] **Step 2: 实现标签共享滑块动画**

```tsx
{isActive && (
  <motion.span
    data-testid="role-switch-indicator"
    layoutId="login-role-indicator"
    className="absolute inset-0 rounded bg-white shadow-sm"
  />
)}
```

- [ ] **Step 3: 实现表单切换动画容器**

```tsx
<AnimatePresence mode="wait" initial={false}>
  <motion.div key={activeRole} data-testid="login-role-panel" data-role={activeRole}>
    {/* form */}
  </motion.div>
</AnimatePresence>
```

- [ ] **Step 4: 兼容减少动态偏好**

```tsx
const shouldReduceMotion = useReducedMotion();
```

- [ ] **Step 5: 运行目标测试验证通过**

Run: `npm run test:run -- src/tests/pages/login.test.tsx`
Expected: PASS

### Task 3: 回归与验收验证

**Files:**
- Modify: `frontend/src/app/login/page.tsx`
- Modify: `frontend/src/tests/pages/login.test.tsx`

- [ ] **Step 1: 运行前端完整构建与测试**

Run: `npm run build && npm run test:run`
Expected: 全量通过

- [ ] **Step 2: 运行后端编译与测试**

Run: `mvn compile && mvn test`
Expected: 全量通过

- [ ] **Step 3: 浏览器验收（web-access + CDP）**

Run: 打开 `/login`，点击“求职者/招聘者”切换，确认标签滑块与表单过渡动画可见且交互正常。
Expected: 满足 AC-001 ~ AC-005

- [ ] **Step 4: 更新版本记录并提交**

```bash
git add docs/superpowers/specs/2026-04-22-141244-login-role-switch-motion-design.md \
        docs/superpowers/acceptance/2026-04-22-141244-login-role-switch-motion-acceptance.md \
        docs/superpowers/plans/2026-04-22-141244-login-role-switch-motion.md \
        frontend/package.json frontend/package-lock.json \
        frontend/src/app/login/page.tsx frontend/src/tests/pages/login.test.tsx

git commit -m "feat(login): 增加角色切换与表单过渡动画"
```
