# 用户端职位详情匹配度圆环展示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将职位详情页“综合匹配度”从文本条替换为环形进度圈展示。

**Architecture:** 在原页面文件内新增局部 `MatchScoreRing` 组件，输入综合分并进行 0-100 边界处理，使用 SVG 圆环表达进度。只调整展示层，保持匹配与投递行为逻辑不变。

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Vitest, Testing Library

---

### Task 1: 更新测试（TDD RED）

**Files:**
- Modify: `frontend/src/tests/pages/user-job-detail-inline-match.test.tsx`
- Test: `frontend/src/tests/pages/user-job-detail-inline-match.test.tsx`

- [x] **Step 1: Write the failing test**
```tsx
await screen.findByTestId('match-score-ring');
await screen.findByText('90%');
```

- [x] **Step 2: Run test to verify it fails**
Run: `npm run test:run -- src/tests/pages/user-job-detail-inline-match.test.tsx`
Expected: FAIL，提示找不到 `data-testid="match-score-ring"`

### Task 2: 实现圆环组件（TDD GREEN）

**Files:**
- Modify: `frontend/src/app/(user)/jobs/[id]/page.tsx`
- Test: `frontend/src/tests/pages/user-job-detail-inline-match.test.tsx`

- [x] **Step 1: Write minimal implementation**
```tsx
function MatchScoreRing({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, score));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - safeScore / 100);
  return (/* SVG ring */);
}
```

- [x] **Step 2: Replace text score block with ring component**
```tsx
<MatchScoreRing score={totalScore} />
```

- [x] **Step 3: Run test to verify it passes**
Run: `npm run test:run -- src/tests/pages/user-job-detail-inline-match.test.tsx`
Expected: PASS

### Task 3: 全量验证

**Files:**
- Verify only

- [ ] **Step 1: 前端构建**
Run: `npm run build`（`frontend`）
Expected: exit 0

- [ ] **Step 2: 前端测试**
Run: `npm run test:run`（`frontend`）
Expected: 全部通过

- [ ] **Step 3: 后端编译**
Run: `mvn compile`（`backend`）
Expected: BUILD SUCCESS

- [ ] **Step 4: 后端测试**
Run: `mvn test`（`backend`）
Expected: BUILD SUCCESS

- [ ] **Step 5: 浏览器验证（CDP）**
通过 `web-access` + CDP 打开职位详情页，触发智能匹配，确认圆环与百分比显示正常。
