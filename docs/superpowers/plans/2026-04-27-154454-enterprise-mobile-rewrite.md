# 企业端移动端无感切换 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 仅对 `/enterprise/**` 在移动设备下执行内部 rewrite 到 `/_mobile/**`，保持 URL 不变并接入企业端手机页面。

**Architecture:** 将路由判定与路径映射封装到 `device-routing` 纯函数中，通过 `middleware.ts` 执行 rewrite。企业端手机页面代码放入 `src/mobile-enterprise`，由 `src/app/_mobile/**` 承接 App Router 路由并渲染。

**Tech Stack:** Next.js App Router, TypeScript, Vitest, React

---

### Task 1: 路由判定与映射 TDD

**Files:**
- Modify: `frontend/src/lib/device-routing.ts`
- Create: `frontend/tests/lib/device-routing-enterprise.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import {
  shouldRewriteEnterpriseToMobile,
  mapEnterprisePathToMobile,
} from "@/lib/device-routing";

describe("enterprise mobile rewrite routing", () => {
  it("rewrites enterprise path for mobile UA", () => {
    expect(shouldRewriteEnterpriseToMobile("/enterprise/jobs", "iPhone")).toBe(true);
  });

  it("does not rewrite for desktop UA", () => {
    expect(shouldRewriteEnterpriseToMobile("/enterprise/jobs", "Mozilla/5.0")).toBe(false);
  });

  it("maps enterprise jobs new path", () => {
    expect(mapEnterprisePathToMobile("/enterprise/jobs/new")).toBe("/jobs/create");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd frontend; npm run test:run -- tests/lib/device-routing-enterprise.test.ts`
Expected: FAIL，提示函数不存在或断言失败。

- [ ] **Step 3: Write minimal implementation**
在 `device-routing.ts` 增加企业端路径判定与映射函数，覆盖 dashboard/jobs/recommendations/employees/notifications 及兜底。

- [ ] **Step 4: Run test to verify it passes**
Run: `cd frontend; npm run test:run -- tests/lib/device-routing-enterprise.test.ts`
Expected: PASS

### Task 2: middleware 重写逻辑 TDD

**Files:**
- Modify: `frontend/middleware.ts`
- Test: `frontend/tests/lib/device-routing-enterprise.test.ts`

- [ ] **Step 1: Write the failing test**
补充中间件所依赖映射用例：`/enterprise/notifications -> /messages`、未知路径回落 `/`。

- [ ] **Step 2: Run test to verify it fails**
Run: `cd frontend; npm run test:run -- tests/lib/device-routing-enterprise.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**
更新 `middleware.ts`：
- 仅命中企业端 + 移动 UA 时 rewrite
- rewrite 目标改为 `/_mobile` 前缀
- 非命中时透传

- [ ] **Step 4: Run test to verify it passes**
Run: `cd frontend; npm run test:run -- tests/lib/device-routing-enterprise.test.ts`
Expected: PASS

### Task 3: 接入企业端移动页面与 App Router 路由

**Files:**
- Create: `frontend/src/mobile-enterprise/*`
- Create: `frontend/src/app/_mobile/layout.tsx`
- Create: `frontend/src/app/_mobile/page.tsx`
- Create: `frontend/src/app/_mobile/jobs/page.tsx`
- Create: `frontend/src/app/_mobile/jobs/create/page.tsx`
- Create: `frontend/src/app/_mobile/jobs/[id]/page.tsx`
- Create: `frontend/src/app/_mobile/jobs/[id]/edit/page.tsx`
- Create: `frontend/src/app/_mobile/recommendations/page.tsx`
- Create: `frontend/src/app/_mobile/candidate/[id]/page.tsx`
- Create: `frontend/src/app/_mobile/team/page.tsx`
- Create: `frontend/src/app/_mobile/messages/page.tsx`

- [ ] **Step 1: Write the failing test**
新增页面最小渲染测试（例如首页与 jobs/create）验证组件可渲染。

- [ ] **Step 2: Run test to verify it fails**
Run: `cd frontend; npm run test:run -- tests/pages/enterprise-mobile-routing.test.tsx`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**
把 `docs/graphhire-企业端-手机端页面/src` 迁移到 `src/mobile-enterprise`，并建立 `_mobile` 路由页面壳调用对应组件。

- [ ] **Step 4: Run test to verify it passes**
Run: `cd frontend; npm run test:run -- tests/pages/enterprise-mobile-routing.test.tsx`
Expected: PASS

### Task 4: 全量验证

**Files:**
- Modify: `frontend` 相关改动

- [ ] **Step 1: Run frontend build**
Run: `cd frontend; npm run build`
Expected: 构建成功（exit code 0）

- [ ] **Step 2: Run frontend tests**
Run: `cd frontend; npm run test:run`
Expected: 测试通过（exit code 0）

- [ ] **Step 3: Run backend compile**
Run: `cd backend; mvn compile`
Expected: 编译通过（exit code 0）

- [ ] **Step 4: Run backend tests**
Run: `cd backend; mvn test`
Expected: 测试通过（exit code 0）

- [ ] **Step 5: Browser verification via web-access/CDP**
Run: 使用 CDP 打开 `/enterprise/dashboard`（手机 UA）
Expected: 地址栏保持 `/enterprise/dashboard`，页面展示企业移动端布局。

