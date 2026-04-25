# 用户职位详情页内联智能匹配 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户端独立匹配页下线，所有匹配入口汇聚到职位详情页，并在详情右侧完成匹配与默认简历一键投递。

**Architecture:** 以 `/jobs/[id]` 为唯一用户职位详情入口，右侧卡片承载匹配与投递状态机。匹配能力复用现有 `personApi/matchApi`，投递能力复用 `personApi.apply` 并改为默认简历自动选择。删除 `/match/[id]` 页面与相关测试，统一链接路径。

**Tech Stack:** Next.js App Router, React hooks, Vitest + Testing Library

---

### Task 1: 先写失败测试覆盖新交互

**Files:**
- Create: `frontend/src/tests/pages/user-job-detail-inline-match.test.tsx`
- Modify: `frontend/src/tests/components/user-layout.test.tsx`
- Modify: `frontend/src/tests/pages/match-detail.test.tsx`（后续删除）

- [ ] **Step 1: 编写职位详情页内联匹配失败测试**

```tsx
it('点击开始智能匹配后展示匹配结果并切换按钮为立即投递', async () => {
  // 渲染 /jobs/[id] 页面，初始断言存在“开始智能匹配”
  // 点击后断言调用 getGraphScore/getMatchDetail
  // 断言出现匹配度并出现“立即投递”按钮
});
```

- [ ] **Step 2: 编写默认简历自动投递失败测试**

```tsx
it('点击立即投递时自动使用默认简历', async () => {
  // mock getMyResumes 返回含默认简历
  // 断言 personApi.apply 参数使用默认简历 id
});

it('无默认简历时提示并且不调用投递接口', async () => {
  // mock getMyResumes 返回无默认简历
  // 断言 apply 未调用 + 出现提示
});
```

- [ ] **Step 3: 更新入口路径测试期望**

```tsx
// UserLayout 仅验证 /jobs/[id] 隐藏 footer，不再验证 /match/[id]
```

- [ ] **Step 4: 运行前端定向测试确认 RED**

Run: `cd frontend; npm run test:run -- src/tests/pages/user-job-detail-inline-match.test.tsx src/tests/components/user-layout.test.tsx`
Expected: FAIL，失败点为页面尚未实现内联匹配状态机或投递逻辑

### Task 2: 实现职位详情页内联匹配与默认简历投递

**Files:**
- Modify: `frontend/src/app/(user)/jobs/[id]/page.tsx`

- [ ] **Step 1: 引入匹配与投递依赖并添加状态**

```tsx
const [matchLoaded, setMatchLoaded] = useState(false);
const [matchLoading, setMatchLoading] = useState(false);
const [matchError, setMatchError] = useState('');
const [graphScore, setGraphScore] = useState<GraphScore | null>(null);
const [matchDetail, setMatchDetail] = useState<PersonMatchDetail | null>(null);
const [applying, setApplying] = useState(false);
const [actionFeedback, setActionFeedback] = useState<string>('');
```

- [ ] **Step 2: 实现 `handleMatch` 与 `handleApplyWithDefaultResume`**

```tsx
const handleMatch = async () => { /* 调用 getGraphScore/getMatchDetail */ };
const handleApplyWithDefaultResume = async () => {
  const resumes = await resumeApi.getMyResumes();
  const defaultResume = resumes.find((r) => r.isDefault);
  if (!defaultResume) { setActionFeedback('请先设置默认简历'); return; }
  await personApi.apply({ jobId, resumeId: defaultResume.id });
};
```

- [ ] **Step 3: 将底部按钮替换为右侧卡片按钮状态机**

```tsx
// 初始显示“开始智能匹配”
// matchLoaded 后显示“立即投递”
// 匹配结果区域显示 matchRate/matchLevel/matchedSkills/missingSkills
```

- [ ] **Step 4: 删除简历选择弹窗逻辑**

```tsx
// 删除 showResumeSelect/resumes/selectedResumeId 及相关 JSX
```

- [ ] **Step 5: 运行定向测试确认 GREEN**

Run: `cd frontend; npm run test:run -- src/tests/pages/user-job-detail-inline-match.test.tsx`
Expected: PASS

### Task 3: 统一入口路由并删除旧匹配页

**Files:**
- Modify: `frontend/src/app/(user)/companies/[id]/page.tsx`
- Modify: `frontend/src/app/(user)/notifications/page.tsx`
- Delete: `frontend/src/app/(user)/match/[id]/page.tsx`
- Delete: `frontend/src/tests/pages/match-detail.test.tsx`

- [ ] **Step 1: 修改公司详情入口到 `/jobs/{id}`**
- [ ] **Step 2: 修改通知推荐入口到 `/jobs/{id}`**
- [ ] **Step 3: 删除旧页面与旧测试**
- [ ] **Step 4: 运行相关测试**

Run: `cd frontend; npm run test:run -- src/tests/components/user-layout.test.tsx`
Expected: PASS

### Task 4: 全量验证与文档更新

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 运行前端编译**

Run: `cd frontend; npm run build`
Expected: BUILD SUCCESS

- [ ] **Step 2: 运行前端测试**

Run: `cd frontend; npm run test:run`
Expected: ALL PASS

- [ ] **Step 3: 运行后端编译与测试**

Run: `cd backend; mvn compile`  
Run: `cd backend; mvn test`
Expected: BUILD SUCCESS + TESTS PASS

- [ ] **Step 4: 浏览器验证（CDP）**

Run: 使用 `/web-access` + chrome-devtools 打开 `/jobs/{id}`，验证：
- 点击“开始智能匹配”后展示匹配结果
- 按钮切换为“立即投递”
- 点击后直接按默认简历投递

- [ ] **Step 5: 更新发布说明并提交**

```bash
git add docs/superpowers/specs/2026-04-25-112146-user-job-detail-inline-match-design.md \
        docs/superpowers/acceptance/2026-04-25-112146-user-job-detail-inline-match-acceptance.md \
        docs/superpowers/plans/2026-04-25-112146-user-job-detail-inline-match.md \
        frontend backend RELEASE-NOTES.md
git commit -m "feat(frontend): 职位详情内联智能匹配与默认简历直投"
```
