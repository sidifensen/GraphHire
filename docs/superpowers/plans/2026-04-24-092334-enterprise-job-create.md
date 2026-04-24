# 企业端新增岗位直发 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复企业端“发布新职位”无响应，并提供新增岗位页提交后直接发布的完整流程。

**Architecture:** 在企业端新增 `jobs/new` 页面承载表单；前端 API 增加 `createJob` 调用；提交时执行 `create -> publish` 串行流程，成功跳回列表页并携带成功标识，失败就地提示。

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library

---

### Task 1: 入口路由修复（AC-001）

**Files:**
- Modify: `frontend/src/app/enterprise/jobs/page.tsx`
- Test: `frontend/src/tests/pages/enterprise-jobs.test.tsx`

- [ ] **Step 1: Write the failing test**
```tsx
test('发布新职位入口跳转到新增岗位页', async () => {
  render(<JobsPage />);
  const link = await screen.findByRole('link', { name: '发布新职位' });
  expect(link).toHaveAttribute('href', '/enterprise/jobs/new');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd frontend; npm run test:run -- src/tests/pages/enterprise-jobs.test.tsx`  
Expected: FAIL，href 仍是 `/enterprise/jobs`

- [ ] **Step 3: Write minimal implementation**
将 `JobsPage` 中 action 链接改为 `href="/enterprise/jobs/new"`。

- [ ] **Step 4: Run test to verify it passes**
Run: `cd frontend; npm run test:run -- src/tests/pages/enterprise-jobs.test.tsx`  
Expected: PASS

### Task 2: 新增岗位页与创建发布流程（AC-002~AC-005）

**Files:**
- Create: `frontend/src/app/enterprise/jobs/new/page.tsx`
- Modify: `frontend/src/lib/api/company.ts`
- Modify: `frontend/src/lib/types/enterprise.ts`
- Test: `frontend/src/tests/pages/enterprise-job-new.test.tsx`

- [ ] **Step 1: Write failing tests**
覆盖：字段校验、创建+发布调用顺序、创建失败、发布失败、成功跳转。

- [ ] **Step 2: Run tests to verify failures**
Run: `cd frontend; npm run test:run -- src/tests/pages/enterprise-job-new.test.tsx`  
Expected: FAIL（页面/API 未实现）

- [ ] **Step 3: Write minimal implementation**
新增表单页面与 `companyApi.createJob`，提交时串行调用：
1) `createJob(payload)`  
2) `publishJob(jobId)`

- [ ] **Step 4: Run tests to verify passes**
Run: `cd frontend; npm run test:run -- src/tests/pages/enterprise-job-new.test.tsx`  
Expected: PASS

### Task 3: 全量验证与提交

**Files:**
- Modify: `RELEASE-NOTES.md`（如仓库已有变更记录要求）

- [ ] **Step 1: Run frontend verification**
Run: `cd frontend; npm run build`  
Run: `cd frontend; npm run test:run`

- [ ] **Step 2: Run backend verification**
Run: `cd backend; mvn compile`  
Run: `cd backend; mvn test`

- [ ] **Step 3: Browser verification via CDP**
使用 `web-access`/CDP 打开企业端职位管理，点击“发布新职位”，完成一次创建并确认列表可见新发布职位。

- [ ] **Step 4: Commit**
```bash
git add docs/superpowers/specs/2026-04-24-092334-enterprise-job-create-design.md docs/superpowers/acceptance/2026-04-24-092334-enterprise-job-create-acceptance.md docs/superpowers/plans/2026-04-24-092334-enterprise-job-create.md frontend/src/app/enterprise/jobs/page.tsx frontend/src/app/enterprise/jobs/new/page.tsx frontend/src/lib/api/company.ts frontend/src/lib/types/enterprise.ts frontend/src/tests/pages/enterprise-jobs.test.tsx frontend/src/tests/pages/enterprise-job-new.test.tsx
git commit -m "feat: 新增企业端岗位创建并直接发布流程"
```
