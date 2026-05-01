# 首页双入口落地页重构（科技理性 + 品牌高端）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页重构为双入口落地页，完整覆盖企业与求职双转化路径，并满足 AC-001 到 AC-012。

**Architecture:** 以 `src/app/page.tsx` 为单一首页实现源，拆分为结构化 section 配置与可复用渲染块，保留 `MockUserShell`。先用测试锁定信息架构与 CTA，再最小实现通过，最后统一视觉语法和交互细节。

**Tech Stack:** Next.js 16、React 19、Tailwind CSS、Vitest + Testing Library、framer-motion、lucide-react

---

### Task 1: 首页 AC 验证测试（RED）

**Files:**
- Create: `frontend/src/tests/pages/home-landing-page.test.tsx`
- Modify: `frontend/src/tests/setup.tsx`
- Test: `frontend/src/tests/pages/home-landing-page.test.tsx`

- [ ] **Step 1: 写失败测试，覆盖关键 AC 结构与文案**

```tsx
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('Home landing dual funnel', () => {
  test('renders dual primary CTAs in hero and final sections', () => {
    render(<HomePage />);
    expect(screen.getAllByRole('link', { name: '免费发布职位' }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByRole('link', { name: '立即找工作' }).length).toBeGreaterThanOrEqual(2);
  });

  test('renders trust metrics and dual value flows', () => {
    render(<HomePage />);
    expect(screen.getByText('活跃企业')).toBeInTheDocument();
    expect(screen.getByText('活跃职位')).toBeInTheDocument();
    expect(screen.getByText('平均匹配时长')).toBeInTheDocument();
    expect(screen.getByText('投递响应率')).toBeInTheDocument();
    expect(screen.getByText('企业招聘流程')).toBeInTheDocument();
    expect(screen.getByText('求职者流程')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test:run -- src/tests/pages/home-landing-page.test.tsx`
Expected: FAIL，缺少新文案/新结构断言。

- [ ] **Step 3: 为 next/image/复杂壳层补必要 mock（若失败由环境导致）**

```tsx
// setup.tsx
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string }) => <img alt={alt} {...props} />,
}));
```

- [ ] **Step 4: 再次运行测试，确保失败原因收敛到首页实现缺口**

Run: `npm run test:run -- src/tests/pages/home-landing-page.test.tsx`
Expected: FAIL（语义断言失败），无环境级崩溃。

- [ ] **Step 5: 提交测试基线**

```bash
git add frontend/src/tests/pages/home-landing-page.test.tsx frontend/src/tests/setup.tsx
git commit -m "test: 新增首页双入口落地页重构失败测试"
```

### Task 2: 首页结构重构实现（GREEN）

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Test: `frontend/src/tests/pages/home-landing-page.test.tsx`

- [ ] **Step 1: 在 `page.tsx` 顶部定义结构化内容配置**

```tsx
const TRUST_METRICS = [
  { label: '活跃企业', value: '10,000+' },
  { label: '活跃职位', value: '128,000+' },
  { label: '平均匹配时长', value: '2.3天' },
  { label: '投递响应率', value: '92.4%' },
];
```

- [ ] **Step 2: 重写 Hero 为双主 CTA 并列（企业/求职）**

```tsx
<Link href="/register?role=enterprise" ...>免费发布职位</Link>
<Link href="/jobs" ...>立即找工作</Link>
```

- [ ] **Step 3: 新增信任背书区块（4 指标）**

```tsx
<section aria-label="信任背书">{TRUST_METRICS.map(...)}</section>
```

- [ ] **Step 4: 新增企业价值流 + 求职价值流 3 步卡片**

```tsx
<section aria-label="企业招聘流程">...</section>
<section aria-label="求职者流程">...</section>
```

- [ ] **Step 5: 新增双侧能力矩阵与案例口碑区**

```tsx
<section aria-label="能力矩阵对照">...</section>
<section aria-label="双侧案例">...</section>
```

- [ ] **Step 6: 新增底部双 CTA 收口**

```tsx
<section aria-label="最终行动">...
  <Link ...>免费发布职位</Link>
  <Link ...>立即找工作</Link>
</section>
```

- [ ] **Step 7: 跑测试验证通过**

Run: `npm run test:run -- src/tests/pages/home-landing-page.test.tsx`
Expected: PASS

- [ ] **Step 8: 提交结构实现**

```bash
git add frontend/src/app/page.tsx frontend/src/tests/pages/home-landing-page.test.tsx
git commit -m "feat: 重构首页双入口落地页核心结构"
```

### Task 3: 视觉语法统一与可访问性收敛（REFACTOR）

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Test: `frontend/src/tests/pages/home-landing-page.test.tsx`

- [ ] **Step 1: 统一按钮/卡片样式语法，去除重复 class 片段**

```tsx
const primaryBtnCls = 'inline-flex items-center justify-center rounded-xl px-6 py-3 ...';
const cardCls = 'rounded-2xl border border-white/10 bg-white/[0.04] ...';
```

- [ ] **Step 2: 控制动效类型与时长（仅保留必要动效）**

```tsx
transition={{ duration: 0.4, ease: 'easeOut' }}
```

- [ ] **Step 3: 补齐可访问性属性（section aria-label、按钮/链接可读文本）**

```tsx
<section aria-label="企业招聘流程">...</section>
```

- [ ] **Step 4: 回归目标测试**

Run: `npm run test:run -- src/tests/pages/home-landing-page.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交重构收敛**

```bash
git add frontend/src/app/page.tsx
git commit -m "refactor: 统一首页落地页视觉语法与可访问结构"
```

### Task 4: 全量前端验证与文档同步

**Files:**
- Modify: `RELEASE-NOTES.md`
- Modify: `docs/superpowers/acceptance/2026-05-01-195000-home-landing-dual-funnel-acceptance.md` (可选：执行完成后补充已验证状态说明)

- [ ] **Step 1: 运行前端构建验证**

Run: `npm run build`
Expected: 成功完成 Next build。

- [ ] **Step 2: 运行前端全量测试**

Run: `npm run test:run`
Expected: 全部通过。

- [ ] **Step 3: 更新 RELEASE-NOTES 记录本次首页重构**

```markdown
- feat: 首页重构为双入口落地页，新增双主 CTA、信任背书、企业/求职双流程、能力矩阵与双侧案例收口
- test: 新增首页落地页测试并通过前端构建与全量测试
```

- [ ] **Step 4: 提交验证与文档变更**

```bash
git add RELEASE-NOTES.md docs/superpowers/acceptance/2026-05-01-195000-home-landing-dual-funnel-acceptance.md
git commit -m "docs: 同步首页落地页重构验收与发布记录"
```

## Spec Coverage Self-Check

- AC-001/002/008/009/010：Task 2
- AC-003/004/005/006/007：Task 2
- AC-011：Task 2 + Task 3
- AC-012：Task 4

无覆盖缺口。
