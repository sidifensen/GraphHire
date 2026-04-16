# 后端 Java 代码注释补充计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 根据 `docs/Java 代码注释规范.md` 的要求，为后端 32 个 Java 文件添加必要注释，覆盖 Controller / AppService / DomainService / RepositoryImpl 四层。

**Architecture:** 按模块分组，每个子代理处理一个模块的所有文件。采用 P0→P1→P2 优先级顺序，先修复 Controller 层（标注率最低），再修复 AppService 层，最后修复 RepositoryImpl 层。

**Tech Stack:** Java, Javadoc

---

## 注释规范速查

| 位置 | 要求 |
|------|------|
| 复杂实现类 (ServiceImpl/DomainService) | Javadoc + `【模块说明】【数据来源】【方法概览】` 分块标签 |
| Controller 方法 | Javadoc `/** */` + `@param name 含义` + `@return 描述` |
| Service 实现方法 | Javadoc + `【功能说明】` + `【业务步骤】` + `// 步骤X：` 对应标注 |
| 私有方法 | 单行/多行 Javadoc |
| 常量/字段 | 行内 `/** 含义 */` |
| 代码分段 | `// =====` + `// 【第X部分】名称` |
| RepositoryImpl | 类 Javadoc + 方法 Javadoc |

---

## 任务总览

| 优先级 | 模块 | 任务数 | 目标文件数 |
|--------|------|--------|------------|
| P0 | Controller 层（7个文件全面修改） | Task 1 | 7 |
| P1 | AppService 层（8个文件） | Task 2 | 8 |
| P2 | DomainService 层（3个文件） | Task 3 | 3 |
| P2 | RepositoryImpl 层（9个文件） | Task 4 | 9 |
| P2 | 部分合格文件修复（5个文件） | Task 5 | 5 |

**总计：5 个 Task，并行处理同一模块内文件**

---

## Task 1: P0 — Controller 层注释补充

**目标：** 7 个 Controller 文件全部方法补充 Javadoc + `@param/@return`

### Task 1.1: MatchController.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/interfaces/controller/MatchController.java`

**当前状态：** 标注率 0%，类注释缺失，全部 6 个方法无 Javadoc

**需补充：**
- 类 Javadoc：简单描述控制器职责
- `triggerMatch()` — `@param request` `@return`
- `getMatchDetail()` — `@param matchId` `@return`
- `getMatchListForResume()` — `@param resumeId` `@return`
- `getMatchListForJob()` — `@param jobId` `@return`

- [ ] **Step 1: 读取 MatchController.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为 4 个接口方法添加 Javadoc + @param/@return**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/match/interfaces/controller/MatchController.java
git commit -m "docs: MatchController 添加 Javadoc 注释"
```

---

### Task 1.2: SkillTagController.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/skill/interfaces/controller/SkillTagController.java`

**当前状态：** 标注率 0%，类注释缺失，全部 11 个方法无 Javadoc

**需补充：**
- 类 Javadoc：技能标签管理接口
- `createSkillTag` — `@param request` `@return`
- `updateSkillTag` — `@param request` `@return`
- `getSkillTag` — `@param id` `@return`
- `getSkillTagByName` — `@param name` `@return`
- `getAllSkillTags` — `@return`
- `getSkillTagsByCategory` — `@param category` `@return`
- `addSynonym` — `@param tagId` `@param synonym` `@return`
- `removeSynonym` — `@param tagId` `@param synonym` `@return`
- `updateCategory` — `@param tagId` `@param category` `@return`
- `normalizeSkills` — `@param skills` `@return`
- `deleteSkillTag` — `@param id` `@return`

- [ ] **Step 1: 读取 SkillTagController.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为 11 个方法添加 Javadoc + @param/@return**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/skill/interfaces/controller/SkillTagController.java
git commit -m "docs: SkillTagController 添加 Javadoc 注释"
```

---

### Task 1.3: JobController.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/JobController.java`

**当前状态：** 标注率 0%，全部 8 个方法无 Javadoc

**需补充：**
- 类 Javadoc：职位管理接口
- `createJob` — `@param request` `@return`
- `publishJob` — `@param id` `@return`
- `closeJob` — `@param id` `@return`
- `updateSalary` — `@param id` `@param salary` `@return`
- `getJob` — `@param id` `@return`
- `getJobsByCompany` — `@param companyId` `@return`
- `getPublishedJobs` — `@param companyId` `@return`
- `deleteJob` — `@param id` `@return`

- [ ] **Step 1: 读取 JobController.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为 8 个方法添加 Javadoc + @param/@return**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/job/interfaces/controller/JobController.java
git commit -m "docs: JobController 添加 Javadoc 注释"
```

---

### Task 1.4: CompanyController.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`

**当前状态：** 15 个方法中仅 3 个合格，其余 12 个缺少 Javadoc

**需补充（12个方法）：**
- `getCompanyInfo` — `@param companyId` `@return`
- `updateCompanyInfo` — `@param companyId` `@param request` `@return`
- `submitAuthMaterials` — `@param companyId` `@param request` `@return`
- `publishJob` — `@param companyId` `@param request` `@return`
- `listJobs` — `@param companyId` `@return`
- `getJob` — `@param jobId` `@return`
- `updateJob` — `@param jobId` `@param request` `@return`
- `toggleJobStatus` — `@param jobId` `@return`
- `reparseJob` — `@param jobId` `@return`
- `getJobGraph` — `@param jobId` `@return`
- `createCompany` — `@param request` `@return`
- `approveCompany` — `@param companyId` `@return`
- `rejectCompany` — `@param companyId` `@return`
- `updateCompany` — `@param companyId` `@param request` `@return`
- `getCompany` — `@param companyId` `@return`
- `getPendingCompanies` — `@return`
- `getCompaniesByAuthStatus` — `@param status` `@return`

- [ ] **Step 1: 读取 CompanyController.java 源码**

- [ ] **Step 2: 为 14 个方法补充 Javadoc + @param/@return**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java
git commit -m "docs: CompanyController 补充 Javadoc 注释"
```

---

### Task 1.5: AdminController.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminController.java`

**当前状态：** 英文类注释不符合规范，所有 12 个方法缺少 `@param/@return`

**需补充：**
- 类 Javadoc（替换现有英文注释）：管理员操作接口
- `adminLogin` — `@param request` `@return`
- `getDashboardStats` — `@return`
- `authCompany` — `@param id` `@param cmd` `@return`
- `modifyUserStatus` — `@param id` `@param enabled` `@return`
- `disableUser` — `@param cmd` `@return`
- `getUserList` — `@param query` `@return`
- `getResumeList` — `@param page` `@param size` `@return`
- `getJobList` — `@param page` `@param size` `@return`
- `getSkillList` — `@return`
- `getTaskList` — `@param page` `@param size` `@return`
- `retryTask` — `@param id` `@return`
- `getCompanyAuthList` — `@return`

- [ ] **Step 1: 读取 AdminController.java 源码**

- [ ] **Step 2: 替换类注释为中文 Javadoc**

- [ ] **Step 3: 为 12 个方法补充 Javadoc + @param/@return**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminController.java
git commit -m "docs: AdminController 补充中文 Javadoc 注释"
```

---

### Task 1.6: ResumeController.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/ResumeController.java`

**当前状态：** 类注释缺失，3 个方法无 Javadoc

**需补充：**
- 类 Javadoc：简历管理接口
- `uploadResume` — `@param request` `@return`
- `getDetail` — `@param resumeId` `@return`
- `getList` — `@param userId` `@return`

- [ ] **Step 1: 读取 ResumeController.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为 3 个方法补充 Javadoc + @param/@return**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/resume/interfaces/controller/ResumeController.java
git commit -m "docs: ResumeController 添加 Javadoc 注释"
```

---

### Task 1.7: PersonController.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java`

**当前状态：** 类注释缺失，全部 11 个方法仅有简单行内注释

**需补充：**
- 类 Javadoc：个人用户简历管理接口
- 11 个方法全部补充标准 Javadoc + `@param/@return`

- [ ] **Step 1: 读取 PersonController.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为 11 个方法补充标准 Javadoc + @param/@return**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java
git commit -m "docs: PersonController 添加 Javadoc 注释"
```

---

## Task 2: P1 — AppService 层注释补充

**目标：** 8 个 AppService 文件补充 `【功能说明】【业务步骤】` + `// 步骤X：`

### Task 2.1: JobAppService.java（全面修改）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/application/service/JobAppService.java`

**当前状态：** 全部 10 个方法缺少 `【功能说明】【业务步骤】`

**需补充：** 所有 10 个方法添加 Javadoc + `【功能说明】【业务步骤】` + `// 步骤X：`

- [ ] **Step 1: 读取 JobAppService.java 源码**

- [ ] **Step 2: 分析每个方法的业务逻辑，编写【业务步骤】**

- [ ] **Step 3: 为 10 个方法添加完整 Javadoc**

- [ ] **Step 4: 为每个业务步骤代码添加 `// 步骤X：` 标注**

- [ ] **Step 5: 添加【第X部分】代码分段注释**

- [ ] **Step 6: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/job/application/service/JobAppService.java
git commit -m "docs: JobAppService 添加【功能说明】【业务步骤】注释"
```

---

### Task 2.2: CompanyAppService.java（全面修改）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/application/service/CompanyAppService.java`

**当前状态：** 所有方法缺少规范注释（1个有英文 Javadoc 不符合规范）

**需补充：** 所有方法添加中文 Javadoc + `【功能说明】【业务步骤】`

- [ ] **Step 1: 读取 CompanyAppService.java 源码**

- [ ] **Step 2: 为 10 个方法添加完整 Javadoc + 业务步骤**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/job/application/service/CompanyAppService.java
git commit -m "docs: CompanyAppService 添加【功能说明】【业务步骤】注释"
```

---

### Task 2.3: MatchAppService.java（全面修改）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`

**当前状态：** 标注率 ~16.7%，无任何方法包含完整的【业务步骤】+ `// 步骤X：`

**需补充：** 全部方法补充完整 Javadoc + `【功能说明】【业务步骤】`

- [ ] **Step 1: 读取 MatchAppService.java 源码**

- [ ] **Step 2: 为所有方法添加完整 Javadoc + 业务步骤 + 步骤标注**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java
git commit -m "docs: MatchAppService 添加【功能说明】【业务步骤】注释"
```

---

### Task 2.4: NotificationAppService.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/notification/application/service/NotificationAppService.java`

**当前状态：** 9 个方法缺少 `【功能说明】【业务步骤】`

**需补充：** 9 个方法补充完整 Javadoc + `【功能说明】【业务步骤】`

- [ ] **Step 1: 读取 NotificationAppService.java 源码**

- [ ] **Step 2: 为 9 个方法添加完整 Javadoc + 业务步骤**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/notification/application/service/NotificationAppService.java
git commit -m "docs: NotificationAppService 添加【功能说明】【业务步骤】注释"
```

---

### Task 2.5: ResumeAppService.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/ResumeAppService.java`

**当前状态：** 仅 `uploadResume` 合格，8 个方法缺少 Javadoc + 业务步骤

**需补充：** 8 个方法补充完整 Javadoc + `【功能说明】【业务步骤】`

- [ ] **Step 1: 读取 ResumeAppService.java 源码**

- [ ] **Step 2: 为 8 个方法添加完整 Javadoc + 业务步骤 + 步骤标注**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/resume/application/service/ResumeAppService.java
git commit -m "docs: ResumeAppService 添加【功能说明】【业务步骤】注释"
```

---

### Task 2.6: AuthAppService.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java`

**当前状态：** 3 个方法缺少完整 Javadoc

**需补充：**
- 第 222 行 `sendVerifyCode(SendVerifyCodeCmd)` — 补充完整 Javadoc
- 第 297 行 `validateToken(TokenValidateQuery)` — 补充【功能说明】
- 第 321 行 `logout(Long)` — 补充完整 Javadoc

- [ ] **Step 1: 读取 AuthAppService.java 源码第 220-330 行**

- [ ] **Step 2: 补充 3 个方法的 Javadoc**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java
git commit -m "docs: AuthAppService 补充 3 个方法 Javadoc"
```

---

### Task 2.7: SkillTagAppService.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/skill/application/service/SkillTagAppService.java`

**当前状态：** 4 个查询方法和 `normalizeSkills` 缺少 `【功能说明】【业务步骤】`

**需补充：** 5 个方法补充完整 Javadoc + `【功能说明】【业务步骤】`

- [ ] **Step 1: 读取 SkillTagAppService.java 源码**

- [ ] **Step 2: 为 5 个方法补充完整 Javadoc + 业务步骤**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/skill/application/service/SkillTagAppService.java
git commit -m "docs: SkillTagAppService 补充查询方法 Javadoc"
```

---

### Task 2.8: AdminAppService.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`

**当前状态：** 字段缺少 `/** */` 注释；业务方法缺少 `@return`；部分方法缺少 `@param`

**需补充：**
- 所有 `@Autowired` 字段添加行内 `/** */` 注释
- 所有业务方法补充完整 Javadoc（`【功能说明】【业务步骤】` + `@param/@return`）

- [ ] **Step 1: 读取 AdminAppService.java 源码**

- [ ] **Step 2: 补充字段注释**

- [ ] **Step 3: 为所有方法补充完整 Javadoc + @param/@return**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java
git commit -m "docs: AdminAppService 补充字段和方法注释"
```

---

## Task 3: P2 — DomainService 层注释补充

**目标：** 3 个 DomainService 文件补充 `【功能说明】` 标签和 `@param/@return`

### Task 3.1: AdminDomainService.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/domain/service/AdminDomainService.java`

**当前状态：** 所有方法缺少 `【功能说明】` 标签

**需补充：** 3 个方法补充完整 Javadoc + `【功能说明】`

- [ ] **Step 1: 读取 AdminDomainService.java 源码**

- [ ] **Step 2: 为 3 个方法补充【功能说明】标签和 @param/@return**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/admin/domain/service/AdminDomainService.java
git commit -m "docs: AdminDomainService 补充【功能说明】标签"
```

---

### Task 3.2: SkillTagDomainService.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/skill/domain/service/SkillTagDomainService.java`

**当前状态：** 类 Javadoc 缺失；2 个方法缺少 `【功能说明】【业务步骤】`

**需补充：**
- 类 Javadoc
- `normalize` 方法补充完整 Javadoc + `【业务步骤】` + `// 步骤X：`
- `findByNameOrSynonym` 方法补充完整 Javadoc

- [ ] **Step 1: 读取 SkillTagDomainService.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为 2 个方法补充完整 Javadoc + 业务步骤**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/skill/domain/service/SkillTagDomainService.java
git commit -m "docs: SkillTagDomainService 添加类和方法注释"
```

---

### Task 3.3: SkillNormalizationService.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/domain/service/SkillNormalizationService.java`

**当前状态：** `normalize()` Javadoc 的【业务步骤】列表残缺

**需补充：** 补充 Javadoc 中的【业务步骤】步骤2/3/4

- [ ] **Step 1: 读取 SkillNormalizationService.java 源码**

- [ ] **Step 2: 修正 normalize() 方法的 Javadoc，补充完整【业务步骤】列表**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/match/domain/service/SkillNormalizationService.java
git commit -m "docs: SkillNormalizationService 补充 normalize() 业务步骤"
```

---

### Task 3.4: JobDomainService.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/domain/service/JobDomainService.java`

**当前状态：** 4 个方法缺少 `@return`

**需补充：** `canPublish`、`canClose`、`findPublishedJobs`、`findJobsByCompany` 补充 `@return`

- [ ] **Step 1: 读取 JobDomainService.java 源码**

- [ ] **Step 2: 为 4 个方法补充 @return**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/job/domain/service/JobDomainService.java
git commit -m "docs: JobDomainService 补充 @return 注释"
```

---

### Task 3.5: ResumeDomainService.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/domain/service/ResumeDomainService.java`

**当前状态：** `isParsable`、`shouldTriggerMatch` 缺少 `@param/@return`

**需补充：** 2 个方法补充 `@param/@return`

- [ ] **Step 1: 读取 ResumeDomainService.java 源码**

- [ ] **Step 2: 为 2 个方法补充 @param/@return**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/resume/domain/service/ResumeDomainService.java
git commit -m "docs: ResumeDomainService 补充参数和返回值注释"
```

---

### Task 3.6: GraphBuildService.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/GraphBuildService.java`

**当前状态：** `buildGraphForJob` 缺少 `@return`

**需补充：** `buildGraphForJob` 方法补充 `@return`

- [ ] **Step 1: 读取 GraphBuildService.java 源码第 66-97 行**

- [ ] **Step 2: 补充 @return 注释**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/resume/application/service/GraphBuildService.java
git commit -m "docs: GraphBuildService 补充 @return 注释"
```

---

## Task 4: P2 — RepositoryImpl 层注释补充

**目标：** 9 个 RepositoryImpl 文件补充类 Javadoc 和方法 Javadoc

### Task 4.1: JobRepositoryImpl.java（全面修改）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobRepositoryImpl.java`

**当前状态：** 类 Javadoc 缺失；7 个 public 方法缺少 Javadoc

**需补充：**
- 类 Javadoc + `【】` 分块标签
- 7 个 public 方法 Javadoc
- `toDomain`、`toPO` 私有方法 Javadoc

- [ ] **Step 1: 读取 JobRepositoryImpl.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为所有 public 方法添加 Javadoc**

- [ ] **Step 4: 为私有方法添加 Javadoc**

- [ ] **Step 5: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobRepositoryImpl.java
git commit -m "docs: JobRepositoryImpl 添加类和方法 Javadoc"
```

---

### Task 4.2: CompanyRepositoryImpl.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyRepositoryImpl.java`

**当前状态：** 6 个 public 方法缺少 Javadoc

**需补充：** 6 个方法 Javadoc

- [ ] **Step 1: 读取 CompanyRepositoryImpl.java 源码**

- [ ] **Step 2: 为 6 个方法添加 Javadoc**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyRepositoryImpl.java
git commit -m "docs: CompanyRepositoryImpl 添加方法 Javadoc"
```

---

### Task 4.3: CompanyStaffRepositoryImpl.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyStaffRepositoryImpl.java`

**当前状态：** 4 个 public 方法缺少 Javadoc

**需补充：** 4 个方法 Javadoc

- [ ] **Step 1: 读取 CompanyStaffRepositoryImpl.java 源码**

- [ ] **Step 2: 为 4 个方法添加 Javadoc**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyStaffRepositoryImpl.java
git commit -m "docs: CompanyStaffRepositoryImpl 添加方法 Javadoc"
```

---

### Task 4.4: JobSkillRepositoryImpl.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobSkillRepositoryImpl.java`

**当前状态：** 4 个 public 方法缺少 Javadoc

**需补充：** 4 个方法 Javadoc

- [ ] **Step 1: 读取 JobSkillRepositoryImpl.java 源码**

- [ ] **Step 2: 为 4 个方法添加 Javadoc**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobSkillRepositoryImpl.java
git commit -m "docs: JobSkillRepositoryImpl 添加方法 Javadoc"
```

---

### Task 4.5: ResumeRepositoryImpl.java（全面修改）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ResumeRepositoryImpl.java`

**当前状态：** 类 Javadoc 缺失；所有方法缺少 Javadoc

**需补充：** 类 Javadoc + 所有方法 Javadoc

- [ ] **Step 1: 读取 ResumeRepositoryImpl.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为所有方法添加 Javadoc**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ResumeRepositoryImpl.java
git commit -m "docs: ResumeRepositoryImpl 添加类和方法 Javadoc"
```

---

### Task 4.6: ParseTaskRepositoryImpl.java（全面修改）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ParseTaskRepositoryImpl.java`

**当前状态：** 类 Javadoc 缺失；所有方法缺少 Javadoc

**需补充：** 类 Javadoc + 所有方法 Javadoc

- [ ] **Step 1: 读取 ParseTaskRepositoryImpl.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为所有方法添加 Javadoc**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ParseTaskRepositoryImpl.java
git commit -m "docs: ParseTaskRepositoryImpl 添加类和方法 Javadoc"
```

---

### Task 4.7: SkillTagRepositoryImpl.java（全面修改）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/skill/infrastructure/persistence/repository/SkillTagRepositoryImpl.java`

**当前状态：** 类 Javadoc 缺失；9 个 public + 2 个 private 方法全部缺少 Javadoc

**需补充：** 类 Javadoc + 所有 11 个方法 Javadoc

- [ ] **Step 1: 读取 SkillTagRepositoryImpl.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为所有 11 个方法添加 Javadoc**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/skill/infrastructure/persistence/repository/SkillTagRepositoryImpl.java
git commit -m "docs: SkillTagRepositoryImpl 添加类和方法 Javadoc"
```

---

### Task 4.8: AdminRepositoryImpl.java（全面修改）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/infrastructure/persistence/repository/AdminRepositoryImpl.java`

**当前状态：** 类 Javadoc 缺失；所有方法 Javadoc 缺失；字段缺少注释

**需补充：** 类 Javadoc + 所有方法 Javadoc + 字段注释

- [ ] **Step 1: 读取 AdminRepositoryImpl.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为字段添加 `/** */` 注释**

- [ ] **Step 4: 为所有方法添加 Javadoc**

- [ ] **Step 5: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/admin/infrastructure/persistence/repository/AdminRepositoryImpl.java
git commit -m "docs: AdminRepositoryImpl 添加类、字段和方法注释"
```

---

### Task 4.9: PersonInfoRepositoryImpl.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/PersonInfoRepositoryImpl.java`

**当前状态：** 类 Javadoc 缺失；`toDomain`、`toPO` 私有方法缺少注释

**需补充：** 类 Javadoc + 私有方法 Javadoc

- [ ] **Step 1: 读取 PersonInfoRepositoryImpl.java 源码**

- [ ] **Step 2: 添加类 Javadoc**

- [ ] **Step 3: 为 toDomain、toPO 添加 Javadoc**

- [ ] **Step 4: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/PersonInfoRepositoryImpl.java
git commit -m "docs: PersonInfoRepositoryImpl 补充类和方法注释"
```

---

## Task 5: P2 — 部分合格文件修复

**目标：** 5 个文件补充剩余注释项

### Task 5.1: MatchRecordRepositoryImpl.java

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/infrastructure/persistence/repository/MatchRecordRepositoryImpl.java`

**当前状态：** 仅 `matchRecordMapper` 字段缺少注释

**需补充：** 字段 `/** 匹配记录 Mapper */`

- [ ] **Step 1: 读取 MatchRecordRepositoryImpl.java 源码**

- [ ] **Step 2: 补充字段注释**

- [ ] **Step 3: 提交 Commit**

```bash
git add backend/src/main/java/com/graphhire/match/infrastructure/persistence/repository/MatchRecordRepositoryImpl.java
git commit -m "docs: MatchRecordRepositoryImpl 补充字段注释"
```

---

## 执行策略

**Task 1.1 ~ Task 1.7（Controller 层 7 个文件）：** 并行执行，每子代理处理 1 个文件

**Task 2.1 ~ Task 2.8（AppService 层 8 个文件）：** 并行执行，每子代理处理 1 个文件

**Task 3.1 ~ Task 3.6（DomainService 层）：** 并行执行，每子代理处理 1 个文件

**Task 4.1 ~ Task 4.9（RepositoryImpl 层 9 个文件）：** 并行执行，每子代理处理 1 个文件

**Task 5.1（部分合格文件）：** 独立任务

**验证方式：** `mvn compile -f backend/pom.xml` 确保代码可编译

---

## 输出产物

1. 32 个文件添加/补充 Javadoc 注释
2. 每个文件单独提交
3. 最终检查报告更新
