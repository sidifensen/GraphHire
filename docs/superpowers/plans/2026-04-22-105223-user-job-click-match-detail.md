# 用户端职位点击跳转匹配详情 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用户在职位列表点击职位后跳转到 `/match/{jobId}`，并在详情页看到职位要求与匹配程度信息。

**Architecture:** 保持现有路由结构不变，复用 `/match/[id]` 页面承担职位详情与匹配展示。在列表页补齐整卡点击跳转，在匹配页补充职位要求区块并复用已有数据流与降级策略。通过前端单元测试先红后绿验证路由跳转和职位要求渲染。

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library

---

### Task 1: 职位列表整卡点击跳转

**Files:**
- Modify: `frontend/tests/pages/jobs.test.tsx`
- Modify: `frontend/src/app/(user)/jobs/page.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it('navigates to match detail when clicking a job card', async () => {
  const push = vi.fn();
  useRouterMock.mockReturnValue({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), forward: vi.fn() });
  render(<JobsPage />);
  const title = await screen.findByText('真实 Java 工程师');
  title.closest('article')?.click();
  expect(push).toHaveBeenCalledWith('/match/1');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/pages/jobs.test.tsx`
Expected: FAIL，提示 `push` 未被调用（当前卡片无跳转行为）。

- [ ] **Step 3: Write minimal implementation**

```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

<article
  key={job.id}
  role="button"
  tabIndex={0}
  onClick={() => router.push(`/match/${job.id}`)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(`/match/${job.id}`);
    }
  }}
  className="... cursor-pointer ..."
>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/pages/jobs.test.tsx`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/pages/jobs.test.tsx frontend/src/app/(user)/jobs/page.tsx
git commit -m "feat(user): 职位卡片支持跳转匹配详情"
```

### Task 2: 匹配详情页展示职位要求

**Files:**
- Modify: `frontend/src/tests/pages/match-detail.test.tsx`
- Modify: `frontend/src/app/(user)/match/[id]/page.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
it('renders job requirements section when required skills exist', async () => {
  render(<MatchDetailPage />);
  await screen.findByText('职位要求');
  expect(screen.getByText('Spring Boot')).toBeDefined();
});

it('renders fallback text when required skills are empty', async () => {
  getJobById.mockResolvedValueOnce({ ...jobPayload, requiredSkills: [] });
  render(<MatchDetailPage />);
  await screen.findByText('职位要求');
  expect(screen.getByText('该职位暂未提供结构化技能要求')).toBeDefined();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- src/tests/pages/match-detail.test.tsx`
Expected: FAIL，提示找不到“职位要求”区块或降级文案。

- [ ] **Step 3: Write minimal implementation**

```tsx
<section>
  <h2>职位要求</h2>
  {job?.requiredSkills && job.requiredSkills.length > 0 ? (
    <div>
      {job.requiredSkills.map((skill) => (
        <span key={skill}>{skill}</span>
      ))}
    </div>
  ) : (
    <p>该职位暂未提供结构化技能要求</p>
  )}
</section>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- src/tests/pages/match-detail.test.tsx`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/tests/pages/match-detail.test.tsx frontend/src/app/(user)/match/[id]/page.tsx
git commit -m "feat(user): 匹配详情页展示职位要求"
```

### Task 3: 全量验证与浏览器验收

**Files:**
- No code changes expected

- [ ] **Step 1: Frontend build**

Run: `cd frontend && npm run build`
Expected: BUILD SUCCESS。

- [ ] **Step 2: Frontend tests**

Run: `cd frontend && npm run test:run`
Expected: ALL PASS。

- [ ] **Step 3: Backend compile**

Run: `cd backend && mvn compile`
Expected: BUILD SUCCESS。

- [ ] **Step 4: Backend tests**

Run: `cd backend && mvn test`
Expected: ALL PASS。

- [ ] **Step 5: Browser verification via CDP**

Run in browser automation:
1. 打开 `http://localhost:8888/jobs`
2. 点击一个职位卡片
3. 确认地址变为 `/match/{jobId}`
4. 确认页面可见“职位要求”区块与匹配信息

Expected: 交互链路符合 AC-001/AC-003/AC-005。
