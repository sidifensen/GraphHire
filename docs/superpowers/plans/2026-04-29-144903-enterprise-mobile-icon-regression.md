# 企业端手机版图标样式回归修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复企业端手机版接入宿主项目后出现的图标缩小与背景缺失回归，同时保持现有页面结构与路由不变。

**Architecture:** 先用样式契约测试锁定根因，再分别修正全局 Material Symbols 规则、Tailwind 主题颜色映射与单点半透明背景写法。验证路径覆盖定向测试、前端全量检查、后端编译测试和浏览器复测。

**Tech Stack:** Next.js, React, Tailwind CSS, Vitest, CDP browser verification

---

### Task 1: 建立样式回归测试（AC-001, AC-002）

**Files:**
- Create: `frontend/tests/lib/mobile-enterprise-style-contract.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import fs from "node:fs";
import path from "node:path";
import tailwindConfig from "../../tailwind.config";

describe("mobile enterprise style contract", () => {
  it("exposes the prototype secondary-container token in tailwind config", () => {
    const colors = (tailwindConfig.theme as { extend?: { colors?: Record<string, string> } })?.extend?.colors ?? {};
    expect(colors["secondary-container"]).toBe("var(--color-secondary-container)");
  });

  it("does not hard-code material symbols font-size in globals.css", () => {
    const globals = fs.readFileSync(path.join(process.cwd(), "src", "styles", "globals.css"), "utf8");
    expect(globals).not.toContain("font-size: 1em;");
    expect(globals).toContain("'opsz' 24");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/lib/mobile-enterprise-style-contract.test.ts`

Expected: FAIL because `secondary-container` is missing and `globals.css` still contains `font-size: 1em;`

### Task 2: 修正宿主样式与主题映射（AC-001, AC-002, AC-003, AC-004）

**Files:**
- Modify: `frontend/tailwind.config.ts`
- Modify: `frontend/src/styles/globals.css`
- Modify: `frontend/src/app/mobile-enterprise/page.tsx`

- [ ] **Step 1: Write minimal implementation**

```ts
// tailwind.config.ts
colors: {
  "secondary-container": "var(--color-secondary-container)",
}
```

```css
/* globals.css */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

```tsx
// mobile-enterprise/page.tsx
<div
  className="w-10 h-10 rounded-full flex items-center justify-center text-primary"
  style={{ backgroundColor: "color-mix(in srgb, var(--color-primary-fixed-dim) 50%, transparent)" }}
>
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npm run test:run -- tests/lib/mobile-enterprise-style-contract.test.ts`

Expected: PASS

- [ ] **Step 3: Run focused regression verification**

Run: `npm run test:run -- src/tests/app/mobile-enterprise-shell.test.tsx src/tests/app/mobile-enterprise-dashboard-page.test.tsx src/tests/app/mobile-enterprise-team-page.test.tsx tests/lib/material-symbols-local.test.ts tests/lib/mobile-enterprise-style-contract.test.ts`

Expected: PASS

### Task 3: 全量验证与浏览器复测（AC-003, AC-004, AC-005）

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: Run frontend build**

Run: `npm run build`

Expected: exit 0

- [ ] **Step 2: Run frontend full tests**

Run: `npm run test:run`

Expected: exit 0

- [ ] **Step 3: Run backend compile**

Run: `mvn compile`

Expected: exit 0

- [ ] **Step 4: Run backend tests**

Run: `mvn test`

Expected: exit 0

- [ ] **Step 5: Verify in browser**

Run: 通过 CDP 打开企业端手机版首页，检查快捷操作圆形背景和顶部/底部导航图标尺寸。

Expected: 关键图标背景恢复，导航主图标不再显示为 14px

### Task 4: 收尾与提交

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: Update release notes**

```md
- 修复企业端手机版图标尺寸回退和背景缺失问题。
```

- [ ] **Step 2: Stage and commit**

Run:

```bash
git add docs/superpowers/specs/2026-04-29-144903-enterprise-mobile-icon-regression-design.md docs/superpowers/acceptance/2026-04-29-144903-enterprise-mobile-icon-regression-acceptance.md docs/superpowers/plans/2026-04-29-144903-enterprise-mobile-icon-regression.md frontend/tailwind.config.ts frontend/src/styles/globals.css frontend/src/app/mobile-enterprise/page.tsx frontend/tests/lib/mobile-enterprise-style-contract.test.ts RELEASE-NOTES.md
git commit -m "fix: 修复企业端手机版图标样式回归"
```
