# AI综合能力评估接口 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为个人用户能力图谱页面提供真实后端评估接口，并让前端评估卡基于接口数据渲染。

**Architecture:** 在 `resume` 应用层新增能力评估服务，基于技能标签做五维打分并输出统一 DTO；`PersonController` 暴露新接口；前端 `personApi` 增加能力评估请求并在 `skill-graph` 页面接入，保留失败兜底。

**Tech Stack:** Spring Boot、JUnit5、Mockito、Next.js、Vitest、Testing Library

---

### Task 1: 后端能力评估服务与接口（TDD）

**Files:**
- Create: `backend/src/main/java/com/graphhire/resume/application/service/PersonAbilityAssessmentService.java`
- Create: `backend/src/main/java/com/graphhire/resume/interfaces/dto/AbilityAssessmentResponse.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java`
- Test: `backend/src/test/java/com/graphhire/resume/interfaces/controller/PersonControllerTest.java`

- [ ] **Step 1: Write the failing test**
  - 在 `PersonControllerTest` 新增用例：`getAbilityAssessment_ReturnsAssessmentPayload`
  - 断言控制器可调用服务并返回 `totalScore` 与五维字段。
- [ ] **Step 2: Run test to verify it fails**
  - Run: `mvn -Dtest=PersonControllerTest test`
  - Expected: 编译失败（缺少新接口/类型）或用例失败。
- [ ] **Step 3: Write minimal implementation**
  - 新增 `AbilityAssessmentResponse` DTO 与 `PersonAbilityAssessmentService`。
  - 在 `PersonController` 注入服务并新增 `GET /person/ability-assessment`。
- [ ] **Step 4: Run test to verify it passes**
  - Run: `mvn -Dtest=PersonControllerTest test`
  - Expected: PASS。

### Task 2: 后端评分逻辑单测（TDD）

**Files:**
- Test: `backend/src/test/java/com/graphhire/resume/application/service/PersonAbilityAssessmentServiceTest.java`

- [ ] **Step 1: Write the failing test**
  - 用例A：空技能返回全 0 且 `LOW`。
  - 用例B：给定多标签集合返回五维分数在 0-100，且总分符合 25/25/20/15/15。
- [ ] **Step 2: Run test to verify it fails**
  - Run: `mvn -Dtest=PersonAbilityAssessmentServiceTest test`
  - Expected: FAIL。
- [ ] **Step 3: Write minimal implementation**
  - 在服务中实现类别映射、现代标签、稀缺标签与总分聚合。
- [ ] **Step 4: Run test to verify it passes**
  - Run: `mvn -Dtest=PersonAbilityAssessmentServiceTest test`
  - Expected: PASS。

### Task 3: 前端接入真实评估接口（TDD）

**Files:**
- Modify: `frontend/src/lib/api/person.ts`
- Modify: `frontend/src/app/(user)/skill-graph/page.tsx`
- Test: `frontend/src/tests/pages/skill-graph.test.tsx`

- [ ] **Step 1: Write the failing test**
  - 扩展 `skill-graph.test.tsx`：mock 新接口返回 `totalScore=88`，断言页面显示 `88`。
- [ ] **Step 2: Run test to verify it fails**
  - Run: `npm run test:run -- src/tests/pages/skill-graph.test.tsx`
  - Expected: FAIL（缺少新 API/页面未使用新分数）。
- [ ] **Step 3: Write minimal implementation**
  - `personApi` 增加 `getAbilityAssessment`。
  - 页面加载时并行获取 graph + assessment；评估失败使用旧算法兜底。
- [ ] **Step 4: Run test to verify it passes**
  - Run: `npm run test:run -- src/tests/pages/skill-graph.test.tsx`
  - Expected: PASS。

### Task 4: 集成验证与收尾

**Files:**
- Modify: `backend/src/test/java/com/graphhire/resume/interfaces/controller/it/PersonControllerIT.java`
- Modify: `RELEASE-NOTES.md`

- [ ] **Step 1: Write failing integration assertion**
  - 在 `PersonControllerIT` 新增 `GET /person/ability-assessment` 断言。
- [ ] **Step 2: Run targeted integration test**
  - Run: `mvn -Dtest=PersonControllerIT test`
- [ ] **Step 3: Full required verification**
  - Frontend build: `npm run build`
  - Frontend tests: `npm run test:run`
  - Backend compile: `mvn compile`
  - Backend tests: `mvn test`
- [ ] **Step 4: Browser validation via CDP**
  - 启动前后端，访问 `http://localhost:8888/skill-graph`，验证分数和图谱可用。
- [ ] **Step 5: Commit**
  - `git add` + `git commit -m "feat: 新增用户能力图谱综合能力评估真实接口"`
