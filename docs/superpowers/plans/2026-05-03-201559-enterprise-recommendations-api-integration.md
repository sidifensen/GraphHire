# 企业端推荐页后端真实对接 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在尽量不改现有 UI 的前提下，让企业端推荐页完全使用真实后端职位与推荐接口，并支持“一键匹配所有候选人”。

**Architecture:** 采用“前端页面替换 mock 数据 + 后端推荐响应最小扩展”的方式。先写前端/后端失败测试锁定行为，再做最小实现使其通过，最后执行前端构建测试与后端匹配模块测试验证。

**Tech Stack:** Next.js 16, React 19, Vitest, Spring Boot, JUnit5, Hutool JSON

---

### Task 1: 前端先写失败测试（推荐页真实接口行为）

**Files:**
- Create: `frontend/tests/pages/enterprise/recommendations-real-api.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it('loads jobs and recommendations from companyApi and supports one-click match', async () => {
  companyApi.getJobList.mockResolvedValue([{ id: 11, title: '算法工程师', status: 'PUBLISHED', city: '北京', matchCount: 2 }]);
  companyApi.getRecommendedResumes.mockResolvedValue([{ resumeId: 101, jobId: 11, score: { total: 88, skillScore: 91, requirementScore: 83 }, resume: { id: 101, fileName: 'A.pdf', skills: ['Java'], education: '本科', experience: '3年' } }]);
  companyApi.triggerJobMatch.mockResolvedValue(undefined);

  render(<RecommendationsPage />);

  expect(await screen.findByText('算法工程师')).toBeInTheDocument();
  expect(await screen.findByText('一键匹配所有候选人')).toBeInTheDocument();
  expect(screen.getByText('综合匹配度 88%')).toBeInTheDocument();
  expect(screen.getByText('技能匹配度 91%')).toBeInTheDocument();
  expect(screen.getByText('岗位要求匹配度 83%')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: '一键匹配所有候选人' }));
  await waitFor(() => expect(companyApi.triggerJobMatch).toHaveBeenCalledWith(11));
  await waitFor(() => expect(companyApi.getRecommendedResumes).toHaveBeenCalledTimes(2));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/pages/enterprise/recommendations-real-api.test.tsx`
Expected: FAIL（当前页面仍依赖 mock 数据，按钮文案与接口行为不符）

### Task 2: 后端先写失败测试（推荐响应简历摘要字段）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/match/application/service/MatchAppServiceTest.java`

- [ ] **Step 1: Write the failing test**

```java
@Test
void getMatchListForJob_shouldIncludeResumeSummaryFields() {
    // 构造带 parseResult 的 Resume，断言 MatchDetailResponse.resume.skills/education/experience 被填充
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `mvn -Dtest=MatchAppServiceTest test`
Expected: FAIL（`MatchDetailResponse.ResumeBasicInfo` 尚无 skills/education/experience 字段）

### Task 3: 实现前端推荐页真实接口对接

**Files:**
- Modify: `frontend/src/app/enterprise/recommendations/page.tsx`

- [ ] **Step 1: 移除 mockJobs/mockCandidates 依赖，接入 `companyApi.getJobList` 与 `companyApi.getRecommendedResumes`**
- [ ] **Step 2: 处理 `jobId` 查询参数优先选中逻辑与职位切换联动请求**
- [ ] **Step 3: 将主按钮文案改为“一键匹配所有候选人”，接入 `companyApi.triggerJobMatch` 并成功后刷新**
- [ ] **Step 4: 刷新按钮接入真实重载逻辑（职位+候选人）**
- [ ] **Step 5: 卡片展示综合/技能/岗位要求匹配度与技能标签、学历、经验，空值兜底**

### Task 4: 扩展前端类型定义

**Files:**
- Modify: `frontend/src/lib/types/enterprise.ts`

- [ ] **Step 1: 在 `EnterpriseRecommendation.resume` 增加 `skills`、`education`、`experience` 可选字段**
- [ ] **Step 2: 保持向后兼容，避免影响现有页面编译**

### Task 5: 实现后端推荐响应简历摘要扩展

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/interfaces/dto/response/MatchDetailResponse.java`

- [ ] **Step 1: 在 `ResumeBasicInfo` 增加 `skills`、`education`、`experience` 字段与 getter**
- [ ] **Step 2: 使用 Hutool JSON 从 `resume.parseResult` 容错提取上述字段（异常回退空）**
- [ ] **Step 3: 不改变既有接口路径与核心匹配逻辑**

### Task 6: 绿测与改动面验证

**Files:**
- Modify: `frontend/tests/pages/enterprise/recommendations-real-api.test.tsx`
- Modify: `backend/src/test/java/com/graphhire/match/application/service/MatchAppServiceTest.java`

- [ ] **Step 1: Run frontend targeted tests to verify GREEN**

Run: `npm run test:run -- tests/pages/enterprise/recommendations-real-api.test.tsx`
Expected: PASS

- [ ] **Step 2: Run backend targeted tests to verify GREEN**

Run: `mvn -Dtest=MatchAppServiceTest test`
Expected: PASS

- [ ] **Step 3: Run frontend mandatory verification**

Run: `npm run build`
Expected: BUILD SUCCESS

Run: `npm run test:run`
Expected: PASS

### Task 7: 更新发布记录并提交

**Files:**
- Modify: `RELEASE-NOTES.md`
- Modify: `docs/superpowers/specs/2026-05-03-201559-enterprise-recommendations-api-integration-design.md`
- Modify: `docs/superpowers/acceptance/2026-05-03-201559-enterprise-recommendations-api-integration-acceptance.md`
- Modify: `docs/superpowers/plans/2026-05-03-201559-enterprise-recommendations-api-integration.md`

- [ ] **Step 1: 在 RELEASE-NOTES 追加本次企业端推荐页真实接口对接说明**
- [ ] **Step 2: 使用中文提交信息提交所有变更**

```bash
git add frontend/src/app/enterprise/recommendations/page.tsx \
  frontend/src/lib/types/enterprise.ts \
  frontend/tests/pages/enterprise/recommendations-real-api.test.tsx \
  backend/src/main/java/com/graphhire/match/interfaces/dto/response/MatchDetailResponse.java \
  backend/src/test/java/com/graphhire/match/application/service/MatchAppServiceTest.java \
  docs/superpowers/specs/2026-05-03-201559-enterprise-recommendations-api-integration-design.md \
  docs/superpowers/acceptance/2026-05-03-201559-enterprise-recommendations-api-integration-acceptance.md \
  docs/superpowers/plans/2026-05-03-201559-enterprise-recommendations-api-integration.md \
  RELEASE-NOTES.md

git commit -m "feat: 企业端推荐页对接真实职位与一键匹配"
```
