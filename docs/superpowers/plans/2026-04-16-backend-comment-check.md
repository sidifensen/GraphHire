# 后端 Java 代码注释检查计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 对照 `docs/Java 代码注释规范.md`，全面检查后端所有 Controller、Service、Repository 层的 Java 代码注释完整性。

**Architecture:** 采用分层分组检查策略，按 Controller → AppService → DomainService → RepositoryImpl 四层逐层检查，每层按模块拆分任务。

**Tech Stack:** Java, Javadoc

---

## 待检查文件清单

### Controllers（9个）
| 模块 | 文件 |
|------|------|
| auth | AuthController |
| admin | AdminController |
| job | JobController, CompanyController |
| resume | ResumeController, PersonController |
| match | MatchController |
| skill | SkillTagController |
| notification | NotificationController |

### AppService（9个）
| 模块 | 文件 |
|------|------|
| auth | AuthAppService |
| admin | AdminAppService |
| job | JobAppService, CompanyAppService |
| resume | ResumeAppService, ParseAppService |
| match | MatchAppService |
| skill | SkillTagAppService |
| notification | NotificationAppService |
| graph | GraphBuildService |

### DomainService（6个）
| 模块 | 文件 |
|------|------|
| admin | AdminDomainService |
| auth | (PasswordEncoder) |
| job | JobDomainService |
| resume | ResumeDomainService |
| match | MatchDomainService, SkillNormalizationService |
| skill | SkillTagDomainService |

### RepositoryImpl（12个）
| 模块 | 文件 |
|------|------|
| auth | UserRepositoryImpl |
| admin | AdminRepositoryImpl |
| job | JobRepositoryImpl, CompanyRepositoryImpl, CompanyStaffRepositoryImpl, JobSkillRepositoryImpl |
| resume | ResumeRepositoryImpl, PersonInfoRepositoryImpl, ParseTaskRepositoryImpl |
| match | MatchRecordRepositoryImpl |
| skill | SkillTagRepositoryImpl |
| notification | NotificationRepositoryImpl |

---

## 检查标准（来自 `docs/Java 代码注释规范.md`）

| 位置 | 要求 |
|------|------|
| 简单类 (接口/VO/枚举) | Javadoc `/** */` 一句话概述 |
| 复杂实现类 (ServiceImpl) | Javadoc + `【】` 分块标签 |
| Controller 方法 | Javadoc + `@param/@return` |
| Service 实现方法 | Javadoc + `【功能说明】【业务步骤】` + `// 步骤X` |
| 私有方法 | 单行/多行 Javadoc |
| 常量字段 | 行内 `/** */` |
| VO/DTO/Entity 字段 | 行内 `/** */` |
| 代码块 | `// 注释内容` 标注业务步骤 |
| Impl 代码分段 | `// =====` + `【第X部分】` |

---

## 任务分解

### Task 1: Auth 模块注释检查

**Files:**
- Modify: `backend/src/main/java/com/graphhire/auth/interfaces/controller/AuthController.java`
- Modify: `backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java`
- Modify: `backend/src/main/java/com/graphhire/auth/domain/model/User.java`
- Modify: `backend/src/main/java/com/graphhire/auth/infrastructure/persistence/repository/UserRepositoryImpl.java`

- [ ] **Step 1: 检查 AuthController.java**
  - 对照规范第2节，检查每个接口方法是否有 Javadoc + `@param/@return`
  - 记录缺失注释的方法清单

- [ ] **Step 2: 检查 AuthAppService.java**
  - 对照规范第3节，检查每个public方法是否有 `【功能说明】【业务步骤】`
  - 检查业务步骤代码是否有 `// 步骤X：` 对应标注
  - 检查是否有 `【第X部分】` 分段注释

- [ ] **Step 3: 检查 User.java (Domain Model)**
  - 对照规范第1节，检查类 Javadoc 是否使用 `【】` 分块
  - 检查字段是否有行内 `/** */` 注释

- [ ] **Step 4: 检查 UserRepositoryImpl.java**
  - 对照规范第1节，检查类 Javadoc
  - 检查方法是否有 Javadoc

---

### Task 2: Admin 模块注释检查

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/interfaces/controller/AdminController.java`
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Modify: `backend/src/main/java/com/graphhire/admin/domain/service/AdminDomainService.java`
- Modify: `backend/src/main/java/com/graphhire/admin/infrastructure/persistence/repository/AdminRepositoryImpl.java`

- [ ] **Step 1: 检查 AdminController.java**

- [ ] **Step 2: 检查 AdminAppService.java**

- [ ] **Step 3: 检查 AdminDomainService.java**

- [ ] **Step 4: 检查 AdminRepositoryImpl.java**

---

### Task 3: Job 模块注释检查

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/JobController.java`
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/service/JobAppService.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/service/CompanyAppService.java`
- Modify: `backend/src/main/java/com/graphhire/job/domain/service/JobDomainService.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyStaffRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobSkillRepositoryImpl.java`

- [ ] **Step 1: 检查 JobController.java**

- [ ] **Step 2: 检查 CompanyController.java**

- [ ] **Step 3: 检查 JobAppService.java**

- [ ] **Step 4: 检查 CompanyAppService.java**

- [ ] **Step 5: 检查 JobDomainService.java**

- [ ] **Step 6: 检查 JobRepositoryImpl 系列**

---

### Task 4: Resume 模块注释检查

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/ResumeController.java`
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java`
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/ResumeAppService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/ParseAppService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/GraphBuildService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/domain/service/ResumeDomainService.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ResumeRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/PersonInfoRepositoryImpl.java`
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ParseTaskRepositoryImpl.java`

- [ ] **Step 1: 检查 ResumeController.java**

- [ ] **Step 2: 检查 PersonController.java**

- [ ] **Step 3: 检查 ResumeAppService.java**

- [ ] **Step 4: 检查 ParseAppService.java**

- [ ] **Step 5: 检查 GraphBuildService.java**

- [ ] **Step 6: 检查 ResumeDomainService.java**

- [ ] **Step 7: 检查 ResumeRepositoryImpl 系列**

---

### Task 5: Match 模块注释检查

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/interfaces/controller/MatchController.java`
- Modify: `backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`
- Modify: `backend/src/main/java/com/graphhire/match/domain/service/MatchDomainService.java`
- Modify: `backend/src/main/java/com/graphhire/match/domain/service/SkillNormalizationService.java`
- Modify: `backend/src/main/java/com/graphhire/match/infrastructure/persistence/repository/MatchRecordRepositoryImpl.java`

- [ ] **Step 1: 检查 MatchController.java**

- [ ] **Step 2: 检查 MatchAppService.java**

- [ ] **Step 3: 检查 MatchDomainService.java**

- [ ] **Step 4: 检查 SkillNormalizationService.java**

- [ ] **Step 5: 检查 MatchRecordRepositoryImpl.java**

---

### Task 6: Skill 模块注释检查

**Files:**
- Modify: `backend/src/main/java/com/graphhire/skill/interfaces/controller/SkillTagController.java`
- Modify: `backend/src/main/java/com/graphhire/skill/application/service/SkillTagAppService.java`
- Modify: `backend/src/main/java/com/graphhire/skill/domain/service/SkillTagDomainService.java`
- Modify: `backend/src/main/java/com/graphhire/skill/infrastructure/persistence/repository/SkillTagRepositoryImpl.java`

- [ ] **Step 1: 检查 SkillTagController.java**

- [ ] **Step 2: 检查 SkillTagAppService.java**

- [ ] **Step 3: 检查 SkillTagDomainService.java**

- [ ] **Step 4: 检查 SkillTagRepositoryImpl.java**

---

### Task 7: Notification 模块注释检查

**Files:**
- Modify: `backend/src/main/java/com/graphhire/notification/interfaces/controller/NotificationController.java`
- Modify: `backend/src/main/java/com/graphhire/notification/application/service/NotificationAppService.java`
- Modify: `backend/src/main/java/com/graphhire/notification/infrastructure/persistence/repository/NotificationRepositoryImpl.java`

- [ ] **Step 1: 检查 NotificationController.java**

- [ ] **Step 2: 检查 NotificationAppService.java**

- [ ] **Step 3: 检查 NotificationRepositoryImpl.java**

---

### Task 8: 生成检查报告

**Files:**
- Create: `docs/superpowers/plans/YYYY-MM-DD-comment-check-report.md`

- [ ] **Step 1: 汇总所有缺失注释的文件和方法**

- [ ] **Step 2: 按规范分类统计缺失项**

- [ ] **Step 3: 生成 Markdown 格式检查报告**

---

## 输出产物

1. 每 Task 完成后的修改文件列表（标注具体缺失位置）
2. 最终检查报告 `docs/superpowers/plans/YYYY-MM-DD-comment-check-report.md`

## 注意事项

- 此任务为代码审计/注释补全，非功能开发
- 优先处理 Controller 和 AppService 层（用户明确要求重点检查）
- DomainService 和 RepositoryImpl 紧随其后
- 检查结果需标注：文件路径 + 缺失行号 + 缺失类型
