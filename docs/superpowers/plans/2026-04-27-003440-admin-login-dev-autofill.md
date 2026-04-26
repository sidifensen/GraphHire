# 管理端登录页开发模式自动填充 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让管理端登录页在开发模式自动填充测试账号，提升本地联调效率且不影响非开发环境安全性。

**Architecture:** 在登录页组件内部增加 `NODE_ENV` 判定，使用常量化测试凭据作为 `useState` 初始值来源。通过 Vitest 页面测试先失败后修复，验证行为仅在开发模式生效。

**Tech Stack:** Next.js 16、React 19、TypeScript、Vitest、Testing Library

---

### Task 1: 先写失败测试（TDD Red）

**Files:**
- Modify: `frontend/tests/pages/admin-login.test.tsx`
- Test: `frontend/tests/pages/admin-login.test.tsx`

- [x] **Step 1: 写失败测试**

```tsx
it('开发模式下自动填充测试账号与密码', async () => {
  vi.resetModules();
  vi.stubEnv('NODE_ENV', 'development');
  const { default: DevAdminLoginPage } = await import('@/app/admin/login/page');
  render(<DevAdminLoginPage />);
  expect(screen.getByLabelText('账号')).toHaveValue('admin');
  expect(screen.getByLabelText('密码')).toHaveValue('123456');
});
```

- [x] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- tests/pages/admin-login.test.tsx`  
Expected: FAIL，提示账号/密码输入框值为空。

### Task 2: 最小实现（TDD Green）

**Files:**
- Modify: `frontend/src/app/admin/login/page.tsx`
- Test: `frontend/tests/pages/admin-login.test.tsx`

- [x] **Step 1: 编写最小生产代码**

```tsx
const isDev = process.env.NODE_ENV === 'development';
const DEV_ADMIN_CREDENTIALS = { username: 'admin', password: '123456' };

const [username, setUsername] = useState(isDev ? DEV_ADMIN_CREDENTIALS.username : '');
const [password, setPassword] = useState(isDev ? DEV_ADMIN_CREDENTIALS.password : '');
```

- [x] **Step 2: 运行测试确认通过**

Run: `npm run test:run -- tests/pages/admin-login.test.tsx`  
Expected: PASS。

### Task 3: 全量验证与浏览器验收

**Files:**
- Verify only: `frontend`, `backend`

- [ ] **Step 1: 前端编译验证**
Run: `npm run build`（cwd=`frontend`）  
Expected: 构建成功。

- [ ] **Step 2: 前端测试验证**
Run: `npm run test:run`（cwd=`frontend`）  
Expected: 全部通过。

- [ ] **Step 3: 后端编译验证**
Run: `mvn compile`（cwd=`backend`）  
Expected: 编译成功。

- [ ] **Step 4: 后端测试验证**
Run: `mvn test`（cwd=`backend`）  
Expected: 全部通过。

- [ ] **Step 5: 浏览器 CDP 验证**
通过 `/web-access`（CDP）打开 `http://localhost:8888/admin/login`，确认开发模式下账号与密码输入框默认值自动填充。

