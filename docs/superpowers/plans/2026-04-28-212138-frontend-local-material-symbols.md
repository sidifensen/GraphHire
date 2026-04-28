# 前端本地 Material Symbols Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将前端当前使用的 Material Symbols 改为仓库内本地子集字体，并写入前端规范，消除运行时 Google 图标外链依赖。

**Architecture:** 保留现有 `material-symbols-outlined` DOM 写法，只替换字体来源。资源层使用本地 `woff2` 子集字体，样式层使用 `@font-face` 接管，规范层在 `frontend/AGENTS.md` 记录后续约束。

**Tech Stack:** Next.js App Router, CSS `@font-face`, Vitest, Google Material Symbols CSS2 子集资源

---

### Task 1: 写失败测试锁定图标来源约束

**Files:**
- Create: `frontend/tests/lib/material-symbols-local.test.ts`
- Test: `frontend/tests/lib/material-symbols-local.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = path.resolve(__dirname, '..', '..')

describe('material symbols local hosting', () => {
  it('removes google icon link from root layout', () => {
    const content = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf8')
    expect(content).not.toContain('Material+Symbols')
    expect(content).not.toContain('fonts.googleapis.com/css2?family=Material+Symbols')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- material-symbols-local.test.ts`  
Expected: FAIL because `layout.tsx` 仍包含 Google Material Symbols 链接

- [ ] **Step 3: Expand the test to cover stylesheet, asset files, and AGENTS rule**

```ts
it('defines a local font-face for material symbols', () => {
  const content = fs.readFileSync(path.join(root, 'src/styles/globals.css'), 'utf8')
  expect(content).toContain("@font-face")
  expect(content).toContain('/fonts/material-symbols-outlined-subset.woff2')
  expect(content).not.toContain("https://fonts.googleapis.com/css2?family=Material+Symbols")
})
```

- [ ] **Step 4: Run test to verify it still fails for the expected reason**

Run: `npm run test:run -- material-symbols-local.test.ts`  
Expected: FAIL because local `@font-face` and files do not exist yet

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/lib/material-symbols-local.test.ts
git commit -m "test: 补充本地 Material Symbols 约束测试"
```

### Task 2: 下载并接入本地 Material Symbols 子集

**Files:**
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/styles/globals.css`
- Create: `frontend/public/fonts/material-symbols-outlined-subset.woff2`
- Create: `frontend/public/fonts/material-symbols-outlined-icons.txt`
- Test: `frontend/tests/lib/material-symbols-local.test.ts`

- [ ] **Step 1: Download the current icon subset from Google official source into `public/fonts`**

```bash
# 先通过 Google CSS2 子集接口获取 CSS，再从 CSS 中提取 woff2 地址下载到本地
```

- [ ] **Step 2: Remove the Google Material Symbols runtime link from `layout.tsx`**

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${manrope.variable} ${inter.variable} bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary-fixed selection:text-on-primary-fixed font-body`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Replace the Material Symbols Google import with a local font-face**

```css
@font-face {
  font-family: 'Material Symbols Outlined';
  font-style: normal;
  font-weight: 100 700;
  src: url('/fonts/material-symbols-outlined-subset.woff2') format('woff2');
}
```

- [ ] **Step 4: Save the current icon list as a tracked text file**

```txt
account_circle
add
...
verified
```

- [ ] **Step 5: Run the focused test to verify it passes**

Run: `npm run test:run -- material-symbols-local.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/layout.tsx frontend/src/styles/globals.css frontend/public/fonts/material-symbols-outlined-subset.woff2 frontend/public/fonts/material-symbols-outlined-icons.txt frontend/tests/lib/material-symbols-local.test.ts
git commit -m "feat: 本地化 Material Symbols 图标资源"
```

### Task 3: 写入前端规范并完成项目级验证

**Files:**
- Modify: `frontend/AGENTS.md`
- Test: `frontend/tests/lib/material-symbols-local.test.ts`

- [ ] **Step 1: Add a short frontend rule for local Material Symbols usage**

```md
## Icon Rule

- 禁止重新引入 Google Material Symbols 外链。
- 继续使用 `material-symbols-outlined` 时，必须复用 `frontend/public/fonts/` 下的本地图标资源。
- 新增 Material Symbols 图标时，同步更新本地图标清单与字体文件。
```

- [ ] **Step 2: Extend or confirm the focused test covers the AGENTS rule**

```ts
it('documents the local icon rule in frontend AGENTS', () => {
  const content = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8')
  expect(content).toContain('Google Material Symbols')
  expect(content).toContain('material-symbols-outlined')
})
```

- [ ] **Step 3: Run all frontend tests**

Run: `npm run test:run`  
Expected: PASS

- [ ] **Step 4: Run frontend build**

Run: `npm run build`  
Expected: exit 0

- [ ] **Step 5: Commit**

```bash
git add frontend/AGENTS.md
git commit -m "docs: 补充前端本地图标规范"
```

## Acceptance Criteria Coverage

| AC ID | Covered By |
|------|------------|
| AC-001 | Task 1, Task 2 |
| AC-002 | Task 1, Task 2 |
| AC-003 | Task 1, Task 2 |
| AC-004 | Task 2 |
| AC-005 | Task 2 |
| AC-006 | Task 3 |
| AC-007 | Task 1, Task 2, Task 3 |
| AC-008 | Task 3 |
| AC-009 | Task 3 |
