# User Header Avatar Dropdown Position Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复用户端 Header 头像下拉弹窗错位，使其右对齐头像按钮并保持现有交互行为。

**Architecture:** 在 `Header` 头像触发区域建立局部定位上下文，弹窗改为相对该容器 `right-0 top-full` 定位。通过组件测试验证 class 变化与菜单展示行为，不引入 portal 或额外定位计算。

**Tech Stack:** Next.js + React + Tailwind CSS + Vitest + Testing Library

---

### Task 1: 先写失败测试覆盖定位需求（AC-002）

**Files:**
- Modify: `frontend/tests/components/Header.test.tsx`
- Test: `frontend/tests/components/Header.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it('anchors user dropdown to avatar trigger container', async () => {
  mockState.isAuthenticated = true;
  mockState.user = {
    id: 1,
    username: 'u@test.com',
    type: 'PERSON',
    avatarUrl: 'http://localhost:7777/person/avatar/public/1',
  } as any;

  render(<MockHeader />);
  const trigger = screen.getByRole('button', { name: /u@test.com/i });
  await userEvent.click(trigger);

  const dropdown = screen.getByText('个人空间').closest('div[class*="absolute"]');
  expect(dropdown?.className).toContain('right-0');
  expect(dropdown?.className).toContain('top-full');
  expect(dropdown?.className).not.toContain('right-8');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:run -- tests/components/Header.test.tsx`
Expected: FAIL，提示期望包含 `right-0` 但实际为 `right-8`

- [ ] **Step 3: Write minimal implementation**

```tsx
<div className="relative flex items-center gap-4">
...
{showDropdown && (
  <div className="absolute right-0 top-full mt-2 w-56 ...">
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:run -- tests/components/Header.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Header.tsx frontend/tests/components/Header.test.tsx docs/superpowers/specs/2026-04-22-133547-user-header-avatar-dropdown-position-design.md docs/superpowers/acceptance/2026-04-22-133547-user-header-avatar-dropdown-position-acceptance.md docs/superpowers/plans/2026-04-22-133547-user-header-avatar-dropdown-position-plan.md
git commit -m "fix(header): 修复用户端头像下拉弹窗定位偏移"
```

### Task 2: 全量验证（AC-001/AC-003）

**Files:**
- Modify: None
- Test: `frontend/tests/components/Header.test.tsx`

- [ ] **Step 1: Run frontend build**

Run: `cd frontend && npm run build`
Expected: BUILD SUCCESS

- [ ] **Step 2: Run backend compile**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS

- [ ] **Step 3: Run frontend tests**

Run: `cd frontend && npm run test:run`
Expected: ALL PASS

- [ ] **Step 4: Run backend tests**

Run: `cd backend && mvn test`
Expected: ALL PASS

- [ ] **Step 5: Browser verification via CDP**

Run: 使用 `/web-access` skill，通过 CDP 打开用户端页面，登录并点击头像。
Expected: 菜单在头像按钮正下方右对齐展示，外部点击可关闭，菜单项可点击。
