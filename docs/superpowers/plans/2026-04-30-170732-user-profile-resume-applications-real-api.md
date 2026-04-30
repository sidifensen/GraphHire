# 用户端个人资料/简历管理/投递记录真实后端对接 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将用户端个人资料、简历管理、投递记录三页切换为真实后端数据与动作，并覆盖核心交互测试。  
**Architecture:** 先为三个页面分别补失败测试，再最小实现页面数据流与动作，最后跑前后端编译/测试与浏览器 CDP 验证。  
**Tech Stack:** Next.js App Router、Axios API Client、Vitest、Maven

---

### Task 1: 个人资料页失败测试（RED）

**Files:**
- Create: `frontend/src/tests/pages/user-personal-info-page.test.tsx`
- Test: `frontend/src/tests/pages/user-personal-info-page.test.tsx`

- [ ] **Step 1: 编写失败测试，覆盖加载、保存、头像上传三条主链路**

```tsx
it('loads profile fields from backend');
it('submits backend-shaped payload on save');
it('uploads avatar and refreshes preview');
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/tests/pages/user-personal-info-page.test.tsx`  
Expected: FAIL（当前页面仍使用 mock 常量与静态头像）

### Task 2: 实现个人资料页（GREEN）

**Files:**
- Modify: `frontend/src/app/(user)/personal-info/page.tsx`
- Modify: `frontend/src/lib/api/person.ts`
- Test: `frontend/src/tests/pages/user-personal-info-page.test.tsx`

- [ ] **Step 1: 将页面状态改为后端 `PersonProfile` 字段模型，挂载时调用 `personApi.getProfile()`**
- [ ] **Step 2: 保存按钮调用 `personApi.updateProfile()`，并加保存中状态与错误提示**
- [ ] **Step 3: 接入头像文件选择与 `personApi.uploadAvatar()`**
- [ ] **Step 4: 运行个人资料页测试并确认通过**

Run: `npm run test:run -- src/tests/pages/user-personal-info-page.test.tsx`  
Expected: PASS

### Task 3: 简历管理页失败测试（RED）

**Files:**
- Create: `frontend/src/tests/pages/user-resume-manage-page.test.tsx`
- Test: `frontend/src/tests/pages/user-resume-manage-page.test.tsx`

- [ ] **Step 1: 编写失败测试，覆盖列表加载、设默认、重新解析、上传按钮四项**

```tsx
it('loads resume list from backend');
it('calls setDefault when clicking set-default');
it('calls parse when clicking reparse');
it('uploads file through uploadWithProgress');
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm run test:run -- src/tests/pages/user-resume-manage-page.test.tsx`  
Expected: FAIL（当前页面仍使用 `MOCK_RESUMES`）

### Task 4: 实现简历管理页与上传页（GREEN）

**Files:**
- Modify: `frontend/src/app/(user)/resume/manage/page.tsx`
- Modify: `frontend/src/app/(user)/resume/upload/page.tsx`
- Modify: `frontend/src/lib/api/resume.ts`
- Test: `frontend/src/tests/pages/user-resume-manage-page.test.tsx`

- [ ] **Step 1: 页面挂载调用 `resumeApi.getMyResumes()`，按真实状态渲染标签**
- [ ] **Step 2: 接入 `setDefault/parse/delete/preview` 动作**
- [ ] **Step 3: 接入文件上传输入，调用 `uploadWithProgress` 后刷新列表**
- [ ] **Step 4: 上传页复用管理页能力，避免双份逻辑偏差**
- [ ] **Step 5: 运行简历管理页测试并确认通过**

Run: `npm run test:run -- src/tests/pages/user-resume-manage-page.test.tsx`  
Expected: PASS

### Task 5: 投递记录与个人中心路由失败测试（RED）

**Files:**
- Create: `frontend/src/tests/pages/user-applications-page.test.tsx`
- Create: `frontend/src/tests/pages/user-profile-links.test.tsx`
- Test: `frontend/src/tests/pages/user-applications-page.test.tsx`
- Test: `frontend/src/tests/pages/user-profile-links.test.tsx`

- [ ] **Step 1: 编写失败测试，覆盖投递列表加载、状态筛选、撤回动作**
- [ ] **Step 2: 编写失败测试，覆盖 profile 菜单链接 `/resume/manage` 与 `/skill-graph`**
- [ ] **Step 3: 运行测试并确认失败**

Run: `npm run test:run -- src/tests/pages/user-applications-page.test.tsx src/tests/pages/user-profile-links.test.tsx`  
Expected: FAIL

### Task 6: 实现投递记录页与 profile 菜单修正（GREEN）

**Files:**
- Modify: `frontend/src/app/(user)/applications/page.tsx`
- Modify: `frontend/src/app/(user)/profile/page.tsx`
- Modify: `frontend/src/lib/api/person.ts`
- Test: `frontend/src/tests/pages/user-applications-page.test.tsx`
- Test: `frontend/src/tests/pages/user-profile-links.test.tsx`

- [ ] **Step 1: 投递页接入 `personApi.getApplications()`，建立状态中文映射与 tab 过滤**
- [ ] **Step 2: 对 `PENDING` 增加撤回按钮并调用 `withdrawApplication`**
- [ ] **Step 3: 修正 profile 菜单链接路径**
- [ ] **Step 4: 运行对应测试并确认通过**

Run: `npm run test:run -- src/tests/pages/user-applications-page.test.tsx src/tests/pages/user-profile-links.test.tsx`  
Expected: PASS

### Task 7: 全量验证与发布记录

**Files:**
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: 前端构建**
Run: `npm run build` (cwd: `frontend`)  
Expected: PASS

- [ ] **Step 2: 前端测试**
Run: `npm run test:run` (cwd: `frontend`)  
Expected: PASS

- [ ] **Step 3: 后端编译**
Run: `mvn compile` (cwd: `backend`)  
Expected: PASS

- [ ] **Step 4: 后端测试**
Run: `mvn test` (cwd: `backend`)  
Expected: PASS

- [ ] **Step 5: 浏览器 CDP 验证（按 web-access 要求）**
Open and verify: `/personal-info`、`/resume/manage`、`/applications`

- [ ] **Step 6: 更新 `RELEASE-NOTES.md` 并提交本次功能改动**

```bash
git add <changed-files>
git commit -m "feat: 对接用户端个人资料简历与投递真实后端"
```
