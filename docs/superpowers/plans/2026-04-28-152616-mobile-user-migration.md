# 移动端用户页面整体迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `frontend/src/mobile-user-page` 的移动端实现整体迁入 `frontend/src/app/mobile-user`，删除旧目录，同时保持现有移动端路由行为不变。

**Architecture:** 保留 `app/mobile-user` 作为 Next App Router 入口目录，将共享组件、样式、路由适配和 mock 数据迁入其私有子目录，并把每个移动端页面实现直接融入对应的 `page.tsx`。迁移以结构测试先行，确保旧目录和临时 `_pages` 转发层都被完全移除后再做最终验证。

**Tech Stack:** Next.js 16、React 19、TypeScript、Vitest、Testing Library

---

### Task 1: 先写结构失败测试

**Files:**
- Create: `frontend/src/tests/app/mobile-user-structure.test.ts`
- Modify: none
- Test: `frontend/src/tests/app/mobile-user-structure.test.ts`

- [ ] **Step 1: 写一个失败测试，断言 `app/mobile-user` 不再引用 `mobile-user-page` 或 `_pages`**

```ts
import fs from "node:fs";
import path from "node:path";

function walkFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    return fullPath;
  });
}

it("does not import from legacy forwarding directories inside app/mobile-user", () => {
  const root = path.join(process.cwd(), "src", "app", "mobile-user");
  const offenders = walkFiles(root)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
    .filter((file) =>
      ["mobile-user-page", "/_pages/", "\\_pages\\"].some((pattern) =>
        fs.readFileSync(file, "utf8").includes(pattern),
      ),
    );

  expect(offenders).toEqual([]);
});
```

- [ ] **Step 2: 运行测试，确认它先失败**

Run: `npm run test:run -- frontend/src/tests/app/mobile-user-structure.test.ts`
Expected: FAIL，列出当前 `app/mobile-user` 中仍引用 `mobile-user-page` 的文件。

- [ ] **Step 3: 再写两个失败测试，断言旧目录和临时 `_pages` 目录都已删除**

```ts
it("removes the legacy mobile-user-page directory", () => {
  const legacyDir = path.join(process.cwd(), "src", "mobile-user-page");
  expect(fs.existsSync(legacyDir)).toBe(false);
});

it("removes the temporary _pages directory", () => {
  const pagesDir = path.join(process.cwd(), "src", "app", "mobile-user", "_pages");
  expect(fs.existsSync(pagesDir)).toBe(false);
});
```

- [ ] **Step 4: 重新运行测试，确认第二个断言也失败**

Run: `npm run test:run -- frontend/src/tests/app/mobile-user-structure.test.ts`
Expected: FAIL，`src/mobile-user-page` 仍存在。

### Task 2: 迁移共享实现到 `app/mobile-user` 私有目录

**Files:**
- Create: `frontend/src/app/mobile-user/_components/*`
- Create: `frontend/src/app/mobile-user/_hooks/*`
- Create: `frontend/src/app/mobile-user/_data/*`
- Create: `frontend/src/app/mobile-user/_lib/router.tsx`
- Create: `frontend/src/app/mobile-user/_styles/mobile-user.css`
- Modify: `frontend/src/app/mobile-user/layout.tsx`
- Test: `frontend/src/tests/app/mobile-user-structure.test.ts`

- [ ] **Step 1: 将共享组件、hooks、mock 数据、类型、样式和路由适配迁入新目录**

```text
移动来源:
- src/mobile-user-page/components/*
- src/mobile-user-page/hooks/*
- src/mobile-user-page/mockData.ts
- src/mobile-user-page/types.ts
- src/mobile-user-page/styles.css
- src/mobile-user-page/router.tsx

目标建议:
- src/app/mobile-user/_components/*
- src/app/mobile-user/_hooks/*
- src/app/mobile-user/_data/mockData.ts
- src/app/mobile-user/_data/types.ts
- src/app/mobile-user/_styles/mobile-user.css
- src/app/mobile-user/_lib/router.tsx
```

- [ ] **Step 2: 更新 `layout.tsx` 使用新样式和新壳组件导入**

```ts
import "./_styles/mobile-user.css";
import MobileShell from "./_components/MobileShell";
```

- [ ] **Step 3: 运行结构测试，确认仍可能只剩页面导入未迁移**

Run: `npm run test:run -- frontend/src/tests/app/mobile-user-structure.test.ts`
Expected: FAIL 数量下降，只剩页面入口还在引用 `mobile-user-page/pages/*`。

### Task 3: 迁移页面实现并修正路由入口

**Files:**
- Modify: `frontend/src/app/mobile-user/page.tsx`
- Modify: `frontend/src/app/mobile-user/applications/page.tsx`
- Modify: `frontend/src/app/mobile-user/companies/page.tsx`
- Modify: `frontend/src/app/mobile-user/companies/[id]/page.tsx`
- Modify: `frontend/src/app/mobile-user/graph/page.tsx`
- Modify: `frontend/src/app/mobile-user/jobs/page.tsx`
- Modify: `frontend/src/app/mobile-user/jobs/[id]/page.tsx`
- Modify: `frontend/src/app/mobile-user/login/page.tsx`
- Modify: `frontend/src/app/mobile-user/notifications/page.tsx`
- Modify: `frontend/src/app/mobile-user/personal-info/page.tsx`
- Modify: `frontend/src/app/mobile-user/profile/page.tsx`
- Modify: `frontend/src/app/mobile-user/register/page.tsx`
- Modify: `frontend/src/app/mobile-user/resume/page.tsx`
- Test: `frontend/src/tests/app/mobile-user-structure.test.ts`

- [ ] **Step 1: 将 `pages/*` 实现直接融入各自的 `page.tsx`**

```text
示例:
- src/mobile-user-page/pages/Home.tsx -> src/app/mobile-user/page.tsx
- src/mobile-user-page/pages/JobList.tsx -> src/app/mobile-user/jobs/page.tsx
- src/mobile-user-page/pages/JobDetail.tsx -> src/app/mobile-user/jobs/[id]/page.tsx
- 不保留 `src/app/mobile-user/_pages/*`
```

- [ ] **Step 2: 将页面内部的 `../components`、`../mockData`、`@/mobile-user-page/router` 等导入全部改成新的同域路径**

```ts
import { Link, useParams } from "../_lib/router";
import { TopNav } from "../_components/TopNav";
import { MOCK_JOBS } from "../_data/mockData";
```

- [ ] **Step 3: 运行结构测试，确认不再有 `mobile-user-page` 引用**

Run: `npm run test:run -- frontend/src/tests/app/mobile-user-structure.test.ts`
Expected: 只剩“旧目录仍存在”这个断言失败。

### Task 4: 删除旧目录并补壳组件测试

**Files:**
- Delete: `frontend/src/mobile-user-page/**`
- Create: `frontend/src/tests/app/mobile-user-shell.test.tsx`
- Test: `frontend/src/tests/app/mobile-user-structure.test.ts`
- Test: `frontend/src/tests/app/mobile-user-shell.test.tsx`

- [ ] **Step 1: 写壳组件测试，覆盖首页显示底部导航、登录页隐藏底部导航**

```tsx
it("shows bottom nav on the mobile home route", () => {
  // mock usePathname -> "/mobile-user"
  // render MobileShell with children
  // expect nav labels to be visible
});

it("hides bottom nav on the mobile login route", () => {
  // mock usePathname -> "/mobile-user/login"
  // render MobileShell with children
  // expect nav labels not to exist
});
```

- [ ] **Step 2: 先运行壳组件测试，确认在迁移前或未补 mock 前按预期失败**

Run: `npm run test:run -- frontend/src/tests/app/mobile-user-shell.test.tsx`
Expected: FAIL，直到新壳组件导入和测试 mock 调整完成。

- [ ] **Step 3: 删除 `src/mobile-user-page` 和临时 `_pages` 目录**

```text
删除:
- src/mobile-user-page/main.tsx
- src/mobile-user-page/App.tsx
- src/mobile-user-page/router.tsx
- src/mobile-user-page/pages/*
- src/mobile-user-page/components/*
- src/mobile-user-page/hooks/*
- src/mobile-user-page/styles.css
- src/mobile-user-page/index.css
- src/mobile-user-page/mockData.ts
- src/mobile-user-page/types.ts
- src/app/mobile-user/_pages/*
```

- [ ] **Step 4: 运行两个测试文件，确认全部通过**

Run: `npm run test:run -- frontend/src/tests/app/mobile-user-structure.test.ts frontend/src/tests/app/mobile-user-shell.test.tsx`
Expected: PASS

### Task 5: 全量验证与收尾

**Files:**
- Modify: none unless修复验证问题
- Test: `frontend/src/tests/lib/device-routing.test.ts`

- [ ] **Step 1: 运行移动端路由映射测试**

Run: `npm run test:run -- frontend/src/tests/lib/device-routing.test.ts`
Expected: PASS

- [ ] **Step 2: 运行前端完整测试集**

Run: `npm run test:run`
Expected: PASS

- [ ] **Step 3: 运行前端构建**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: 运行后端编译与测试**

Run: `mvn compile`
Expected: PASS

Run: `mvn test`
Expected: PASS

- [ ] **Step 5: 使用浏览器验证移动端首页、职位页、登录页**

```text
访问建议:
- http://localhost:8888/mobile-user
- http://localhost:8888/mobile-user/jobs
- http://localhost:8888/mobile-user/login

检查点:
- 首页显示底部导航
- 职位页可以正常渲染
- 登录页隐藏底部导航
```

- [ ] **Step 6: 提交**

```bash
git add docs/superpowers/memory docs/superpowers/specs docs/superpowers/acceptance docs/superpowers/plans frontend/src/app/mobile-user frontend/src/tests frontend/src/lib
git commit -m "refactor: 迁移移动端用户页面到 app 目录"
```
