# Resume Manage Time/Status Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复用户端简历管理页时间显示与状态显示错误，确保与后端真实数据一致。

**Architecture:** 后端在领域模型补齐时间字段并透传，前端在 API 层统一做状态与时间字段归一化，页面层做时间格式兜底。通过前后端单测先失败后通过，最后做浏览器端回归验证。

**Tech Stack:** Spring Boot + MyBatis-Plus + Hutool, Next.js + TypeScript + Vitest

---

### Task 1: 前端 API 映射 TDD（AC-001, AC-002）

**Files:**
- Create: `frontend/tests/lib/api/resume.test.ts`
- Modify: `frontend/src/lib/api/resume.ts`

- [ ] **Step 1: Write the failing test**
添加测试覆盖 `createTime` 与 `SUCCESS/PARSING` 输入，断言输出 `createdAt` 与 `COMPLETED/PROCESSING`。

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test:run -- tests/lib/api/resume.test.ts`
Expected: FAIL（当前无映射逻辑）

- [ ] **Step 3: Write minimal implementation**
在 `resumeApi` 增加 `normalizeResume`，对时间与状态进行兼容映射。

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test:run -- tests/lib/api/resume.test.ts`
Expected: PASS

### Task 2: 后端时间字段透传 TDD（AC-004）

**Files:**
- Modify: `backend/src/test/java/com/graphhire/resume/infrastructure/persistence/repository/ResumeRepositoryImplTest.java`
- Modify: `backend/src/main/java/com/graphhire/resume/domain/model/Resume.java`

- [ ] **Step 1: Write the failing test**
在仓储测试中断言 `createTime/updateTime` 从 `ResumePO` 映射到 `Resume`。

- [ ] **Step 2: Run test to verify it fails**
Run: `mvn -Dtest=ResumeRepositoryImplTest test`
Expected: FAIL（`Resume` 尚无对应字段）

- [ ] **Step 3: Write minimal implementation**
在 `Resume` 新增 `createTime/updateTime` 字段及 getter/setter。

- [ ] **Step 4: Run test to verify it passes**
Run: `mvn -Dtest=ResumeRepositoryImplTest test`
Expected: PASS

### Task 3: 页面渲染兜底与回归（AC-003, AC-005）

**Files:**
- Modify: `frontend/src/app/(user)/resume/manage/page.tsx`
- Modify: `frontend/tests/pages/resume-manage.test.tsx`

- [ ] **Step 1: Write the failing test**
新增页面测试，断言非法时间显示 `-`，并显示“解析成功/解析中”文案。

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test:run -- tests/pages/resume-manage.test.tsx`
Expected: FAIL（当前显示 `Invalid Date` 与旧文案）

- [ ] **Step 3: Write minimal implementation**
增加安全日期格式化函数与目标状态文案。

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test:run -- tests/pages/resume-manage.test.tsx`
Expected: PASS

### Task 4: 完整验证与收尾

**Files:**
- Modify: `RELEASE-NOTES.md`（如本仓库已有更新规范）

- [ ] **Step 1: Run required checks**
Run frontend: `npm run build`、`npm run test:run`
Run backend: `mvn compile`、`mvn test`
Expected: 全部通过

- [ ] **Step 2: Browser validation via CDP**
通过 `/web-access` + CDP 打开 `/resume/manage`，确认时间显示与状态文案正确。

- [ ] **Step 3: Commit**
`git add` 修改文件并按规范提交：`fix(resume): 修复简历管理时间与解析状态显示异常`
