# Auth Avatar Profile Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让求职者端与招聘者端在登录后显示头像+名称，并让求职者个人主页展示对应登录用户信息且保持持久登录态。

**Architecture:** 在现有 `auth-store` 持久化会话基础上扩展 `displayName` 字段，并在用户端 Navbar、企业端 TopNav 各自按域异步拉取 profile 数据回填 store；个人主页从 store + person profile 组合渲染真实信息。

**Tech Stack:** Next.js App Router, React Client Components, Zustand persist, Vitest + Testing Library

---

### Task 1: 扩展认证状态模型并补测试基线

**Files:**
- Modify: `frontend/src/lib/stores/auth-store.ts`
- Modify: `frontend/src/tests/setup.tsx`
- Test: `frontend/src/tests/lib/auth-store-domain.test.ts`

- [ ] **Step 1: 写失败测试（认证状态支持 displayName）**

```ts
// 在 auth-store-domain.test.ts 新增：
expect(typeof user.displayName === 'string' || user.displayName === undefined).toBe(true)
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- src/tests/lib/auth-store-domain.test.ts`
Expected: FAIL（类型/字段不存在）

- [ ] **Step 3: 最小实现扩展 auth store user 结构**

```ts
user: { id: number; username: string; displayName?: string; ... }
updateUser: Partial<{ ... displayName?: string ... }>
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test:run -- src/tests/lib/auth-store-domain.test.ts`
Expected: PASS

### Task 2: 用户端 Navbar 显示头像名称并回填个人资料

**Files:**
- Modify: `frontend/src/app/(user)/_mock/components/Navbar.tsx`
- Test: `frontend/src/tests/components/mock-user-navbar-auth.test.tsx`

- [ ] **Step 1: 先写失败组件测试**

```tsx
render(<Navbar />)
expect(screen.getByText('测试求职者')).toBeInTheDocument()
expect(screen.getByAltText('用户头像')).toBeInTheDocument()
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- src/tests/components/mock-user-navbar-auth.test.tsx`
Expected: FAIL（当前 Navbar 未接 auth store）

- [ ] **Step 3: 最小实现 Navbar 登录态展示与 profile 回填**

```tsx
const isAuthenticated = userAuthStore((s) => s.isAuthenticated)
const user = userAuthStore((s) => s.user)
useEffect(() => { if (isAuthenticated) personApi.getProfile()...updateUser(...) }, [isAuthenticated])
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test:run -- src/tests/components/mock-user-navbar-auth.test.tsx`
Expected: PASS

### Task 3: 企业端 TopNav 显示头像名称并回填企业资料

**Files:**
- Modify: `frontend/src/app/enterprise/_mock/components/TopNav.tsx`
- Modify: `frontend/src/lib/api/company.ts`
- Test: `frontend/src/tests/components/mock-enterprise-topnav-auth.test.tsx`

- [ ] **Step 1: 先写失败组件测试**

```tsx
render(<TopNav title="GraphHire 图谱智聘" userAvatar />)
expect(screen.getByText('测试企业')).toBeInTheDocument()
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- src/tests/components/mock-enterprise-topnav-auth.test.tsx`
Expected: FAIL

- [ ] **Step 3: 最小实现企业名称+头像展示与 store 回填**

```tsx
const user = enterpriseAuthStore((s)=>s.user)
const updateUser = enterpriseAuthStore((s)=>s.updateUser)
useEffect(() => { if (isAuthenticated) companyApi.getInfo() ... updateUser(...) }, [...])
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test:run -- src/tests/components/mock-enterprise-topnav-auth.test.tsx`
Expected: PASS

### Task 4: 求职者个人主页显示对应用户信息

**Files:**
- Modify: `frontend/src/app/(user)/profile/page.tsx`
- Test: `frontend/src/tests/pages/user-profile-auth-info.test.tsx`

- [ ] **Step 1: 先写失败页面测试**

```tsx
render(<Profile />)
await screen.findByText('测试姓名')
expect(screen.getByText('test-user@example.com')).toBeInTheDocument()
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- src/tests/pages/user-profile-auth-info.test.tsx`
Expected: FAIL（当前为静态假数据）

- [ ] **Step 3: 最小实现个人主页数据绑定**

```tsx
const authUser = userAuthStore((s)=>s.user)
useEffect(() => { personApi.getProfile()... }, [])
const displayName = profile?.realName || authUser?.displayName || authUser?.username
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm run test:run -- src/tests/pages/user-profile-auth-info.test.tsx`
Expected: PASS

### Task 5: 回归与交付验证

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 运行前端测试全集**

Run: `npm run test:run`
Expected: 全部 PASS

- [ ] **Step 2: 运行前端构建**

Run: `npm run build`
Expected: 构建成功，exit code 0

- [ ] **Step 3: 运行后端编译与测试**

Run: `mvn compile`
Expected: SUCCESS

Run: `mvn test`
Expected: SUCCESS

- [ ] **Step 4: 浏览器 CDP 验证**

Run: 使用 CDP 打开 `/login`，完成登录后验证：
- 用户端顶部右侧显示头像+名称
- 企业端顶部右侧显示头像+名称
- 用户 `/profile` 显示当前账号对应资料

- [ ] **Step 5: 更新发布记录并提交**

```bash
git add docs/superpowers/specs/2026-04-30-153125-auth-avatar-profile-sync-design.md docs/superpowers/acceptance/2026-04-30-153125-auth-avatar-profile-sync-acceptance.md docs/superpowers/plans/2026-04-30-153125-auth-avatar-profile-sync.md RELEASE-NOTES.md frontend/src/... frontend/src/tests/...
git commit -m "feat: 注册登录后展示头像与用户名并同步个人主页信息"
```
