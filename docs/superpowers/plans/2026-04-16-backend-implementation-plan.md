# GraphHire 后端完整实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成 GraphHire 后端所有功能，实现 03_接口设计.md 中全部 73 个接口，端到端业务流程闭环，测试全覆盖。

**Architecture:** 基于 Spring Boot 3 + DDD 单体架构，按领域模块划分（auth/person/resume/job/company/match/notification/skill/admin），使用 MyBatis-Plus 访问 PostgreSQL，Sa-Token 做认证鉴权，RocketMQ 做异步解耦。

**Tech Stack:** Spring Boot 3.4.5, MyBatis-Plus 3.5.10, PostgreSQL, Redis, Sa-Token 1.45.0, RocketMQ, Apache Tika, DeepSeek API, Memgraph

---

## 第一阶段：基础设施补全（PO/Mapper/Repository）

### Task 1: 修正 UserPO 与 sys_user 表对齐 + 实现 Admin 基础设施

**Files:**
- Modify: `backend/src/main/java/com/graphhire/auth/infrastructure/persistence/po/UserPO.java` — 对齐 sys_user 表（user_type, email, failed_attempts, lock_until 等）
- Modify: `backend/src/main/java/com/graphhire/auth/infrastructure/persistence/repository/UserRepositoryImpl.java` — 修复 findByUsername bug，对齐 PO 字段
- Create: `backend/src/main/java/com/graphhire/admin/infrastructure/persistence/po/AdminPO.java`
- Create: `backend/src/main/java/com/graphhire/admin/infrastructure/persistence/mapper/AdminMapper.java`
- Create: `backend/src/main/java/com/graphhire/admin/infrastructure/persistence/repository/AdminRepositoryImpl.java`
- Create: `backend/src/test/java/com/graphhire/admin/infrastructure/persistence/repository/AdminRepositoryImplTest.java`

**Steps:**
- [ ] **Step 1: 重写 UserPO 对齐 sys_user 表**
  - 参考 schema.sql 的 sys_user 字段：username, password, email, user_type(SMALLINT), status(SMALLINT), last_login_time, last_login_ip, failed_attempts, lock_until, created_at, updated_at
  - 将 userType/status 从 String 改为 Integer
  - 删除 t_user 改用 sys_user 表名（`@TableName("sys_user")`）

- [ ] **Step 2: 修复 UserRepositoryImpl.findByUsername**
  - 当前 bug：创建 UserPO 但没设置 username 作为查询条件
  - 改用 `userMapper.selectOne(new LambdaQueryWrapper<UserPO>().eq(UserPO::getUsername, username))`

- [ ] **Step 3: 创建 AdminPO**
  - 映射 sys_user 表用于管理员数据查询（Admin 模块需要查询所有用户/企业/简历等）
  - 字段：id, username, email, userType, status, createdAt

- [ ] **Step 4: 创建 AdminMapper**
  - 继承 BaseMapper<AdminPO>

- [ ] **Step 5: 创建 AdminRepositoryImpl**
  - 实现 AdminRepository 接口
  - 实现方法：findUserById, findAllUsers(page), countUsers, findPendingCompanies, updateCompanyAuthStatus, updateUserStatus

- [ ] **Step 6: 编写 AdminRepositoryImpl 单元测试（Mock MyBatis-Plus）**

### Task 2: 实现 Company/CompanyStaff 基础设施（PO/Mapper/Repository）

**Files:**
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/CompanyPO.java`
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/CompanyStaffPO.java`
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/mapper/CompanyMapper.java`
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/mapper/CompanyStaffMapper.java`
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyRepositoryImpl.java`
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyStaffRepositoryImpl.java`
- Create: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/repository/CompanyRepositoryImplTest.java`
- Create: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/repository/CompanyStaffRepositoryImplTest.java`

**Steps:**
- [ ] **Step 1: 创建 CompanyPO** — 对齐 schema.sql 的 company 表（id, user_id, company_name, unified_social_credit_code, license_path, auth_status, auth_reason, auth_time, created_at, updated_at）

- [ ] **Step 2: 创建 CompanyStaffPO** — 对齐 schema.sql 的 company_staff 表（id, company_id, user_id, post, created_at）

- [ ] **Step 3: 创建 CompanyMapper** — 继承 BaseMapper<CompanyPO>

- [ ] **Step 4: 创建 CompanyStaffMapper** — 继承 BaseMapper<CompanyStaffPO>

- [ ] **Step 5: 实现 CompanyRepositoryImpl** — 实现 CompanyRepository 接口（findById, findByUserId, findByAuthStatus, save, updateAuthStatus）

- [ ] **Step 6: 实现 CompanyStaffRepositoryImpl** — 实现 CompanyStaffRepository（findByUserId, findByCompanyId, save）

- [ ] **Step 7: 编写 CompanyRepositoryImplTest 和 CompanyStaffRepositoryImplTest**

### Task 3: 实现 PersonInfo/Resume 基础设施（对齐 schema）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/po/ResumePO.java` — 对齐 resume 表（file_type, file_size, parse_status, parse_error, confidence, is_default）
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/po/PersonInfoPO.java` — 对齐 person_profile 表（real_name, gender, age, phone, education, city, target_city, expected_salary）
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/po/ParseTaskPO.java` — 对齐 parse_task 表
- Modify: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/repository/ResumeRepositoryImpl.java` — 对齐新 PO 字段
- Create: `backend/src/main/java/com/graphhire/resume/infrastructure/persistence/mapper/PersonInfoMapper.java`
- Create: `backend/src/test/java/com/graphhire/resume/infrastructure/persistence/repository/PersonInfoRepositoryImplTest.java`
- Create: `backend/src/test/java/com/graphhire/resume/infrastructure/persistence/repository/ResumeRepositoryImplTest.java`

**Steps:**
- [ ] **Step 1: 重写 ResumePO** — 添加 fileType, fileSize, parseStatus, parseError, confidence, isDefault；删除 status（改为 parseStatus）；parseResult 改为 JSONB 类型

- [ ] **Step 2: 重写 PersonInfoPO** — 对齐 person_profile 表所有字段

- [ ] **Step 3: 重写 ParseTaskPO** — 对齐 parse_task 表（taskType, resumeId, jobId, status, retryCount, errorMessage, startedAt, completedAt）

- [ ] **Step 4: 创建 PersonInfoMapper** — 继承 BaseMapper<PersonInfoPO>

- [ ] **Step 5: 修复 ResumeRepositoryImpl** — toDomain/toPO 方法对齐新 PO 字段

- [ ] **Step 6: 创建 PersonInfoRepositoryImpl** — 如果不存在需要创建

- [ ] **Step 7: 编写 PersonInfoRepositoryImplTest 和 ResumeRepositoryImplTest**

### Task 4: 实现 SkillTag/JobSkill 基础设施

**Files:**
- Create: `backend/src/main/java/com/graphhire/skill/infrastructure/persistence/po/SkillTagPO.java`
- Create: `backend/src/main/java/com/graphhire/skill/infrastructure/persistence/mapper/SkillTagMapper.java`
- Modify: `backend/src/main/java/com/graphhire/skill/infrastructure/persistence/repository/SkillTagRepositoryImpl.java` — 实现所有 stub 方法
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/po/JobSkillPO.java`
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/mapper/JobSkillMapper.java`
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/JobSkillRepositoryImpl.java`
- Create: `backend/src/test/java/com/graphhire/skill/infrastructure/persistence/repository/SkillTagRepositoryImplTest.java`
- Create: `backend/src/test/java/com/graphhire/job/infrastructure/persistence/repository/JobSkillRepositoryImplTest.java`

**Steps:**
- [ ] **Step 1: 创建 SkillTagPO** — 对齐 schema.sql 的 skill_tag 表（id, tag_name, category, created_at）

- [ ] **Step 2: 创建 SkillTagMapper** — 继承 BaseMapper<SkillTagPO>

- [ ] **Step 3: 实现 SkillTagRepositoryImpl** — 实现全部方法：findById, findByName, findBySynonym, findByCategory, findAll, save, delete, findByNames, count

- [ ] **Step 4: 创建 JobSkillPO** — 对齐 job_skill 表（id, job_id, skill_tag_id, is_required, weight）

- [ ] **Step 5: 创建 JobSkillMapper** — 继承 BaseMapper<JobSkillPO>

- [ ] **Step 6: 创建 JobSkillRepositoryImpl** — 实现 JobSkillRepository（findByJobId, findBySkillTagId, save, deleteByJobId）

- [ ] **Step 7: 编写 SkillTagRepositoryImplTest 和 JobSkillRepositoryImplTest**

### Task 5: 实现 Notification 基础设施

**Files:**
- Create: `backend/src/main/java/com/graphhire/notification/infrastructure/persistence/po/NotificationPO.java`
- Create: `backend/src/main/java/com/graphhire/notification/infrastructure/persistence/mapper/NotificationMapper.java`
- Modify: `backend/src/main/java/com/graphhire/notification/infrastructure/persistence/repository/NotificationRepositoryImpl.java` — 实现所有 stub 方法
- Create: `backend/src/test/java/com/graphhire/notification/infrastructure/persistence/repository/NotificationRepositoryImplTest.java`

**Steps:**
- [ ] **Step 1: 创建 NotificationPO** — 对齐 schema.sql 的 notification 表（id, user_id, type, title, content, is_read, reference_id, created_at）

- [ ] **Step 2: 创建 NotificationMapper** — 继承 BaseMapper<NotificationPO>

- [ ] **Step 3: 实现 NotificationRepositoryImpl** — 实现全部方法：findById, findByUserId, findByUserIdAndIsRead, findByUserIdAndType, findUnreadByUserId, save, delete, countUnreadByUserId, markAllAsReadByUserId

- [ ] **Step 4: 编写 NotificationRepositoryImplTest**

### Task 6: 实现 MatchRecord 基础设施（对齐 schema）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/infrastructure/persistence/po/MatchRecordPO.java` — 对齐 match_record 表
- Modify: `backend/src/main/java/com/graphhire/match/infrastructure/persistence/repository/MatchRecordRepositoryImpl.java` — 对齐新 PO 字段
- Create: `backend/src/test/java/com/graphhire/match/infrastructure/persistence/repository/MatchRecordRepositoryImplTest.java`

**Steps:**
- [ ] **Step 1: 重写 MatchRecordPO** — 对齐 schema.sql（overall_score, skill_score, experience_score, city_score, education_score, salary_score, match_report, status, created_at）

- [ ] **Step 2: 修复 MatchRecordRepositoryImpl** — toDomain/toPO 方法对齐新 PO

- [ ] **Step 3: 编写 MatchRecordRepositoryImplTest**

### Task 7: 实现 AdminDomainService 和 AdminAppService 完整业务逻辑

**Files:**
- Modify: `backend/src/main/java/com/graphhire/admin/domain/service/AdminDomainService.java`
- Modify: `backend/src/main/java/com/graphhire/admin/application/service/AdminAppService.java`
- Create: `backend/src/test/java/com/graphhire/admin/application/service/AdminAppServiceTest.java`

**Steps:**
- [ ] **Step 1: 实现 AdminAppService.stubs** — authCompany(), disableUser(), getUserList() 完整实现

- [ ] **Step 2: 实现 AdminDomainService** — 审核逻辑、用户状态变更逻辑

- [ ] **Step 3: 编写 AdminAppServiceTest（Mock Repository 层）**

---

## 第二阶段：接口实现（Controller 层）

### Task 8: 实现 PersonController 全部接口

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java`
- Create: `backend/src/test/java/com/graphhire/resume/interfaces/controller/PersonControllerTest.java`

**接口列表（按 03_接口设计.md）：**
| 接口 | 方法 | 说明 |
|------|------|------|
| /person/info | GET | 获取个人信息 |
| /person/info | PUT | 更新个人信息 |
| /person/resume/upload | POST | 上传简历 |
| /person/resume/list | GET | 简历列表 |
| /person/resume/{id} | DELETE | 删除简历 |
| /person/resume/{id}/default | PUT | 设置默认简历 |
| /person/resume/{id}/parse | POST | 重新解析简历 |
| /person/resume/{id}/detail | GET | 简历详情（解析后） |
| /person/graph | GET | 获取个人能力图谱 |
| /person/recommend/jobs | GET | 获取推荐职位列表 |
| /person/match/{jobId} | GET | 获取与职位的匹配详情 |

**Steps:**
- [ ] **Step 1: 实现 GET /person/info** — 从 SecurityContext 获取当前用户 ID，查询 personInfo

- [ ] **Step 2: 实现 PUT /person/info** — 更新 personInfo（姓名、性别、年龄、学历、城市、期望薪资等）

- [ ] **Step 3: 实现 POST /person/resume/upload** — 文件上传到 RustFS，创建 resume 记录，发送 MQ 消息

- [ ] **Step 4: 实现 GET /person/resume/list** — 分页查询当前用户简历列表

- [ ] **Step 5: 实现 DELETE /person/resume/{id}** — 校验所有者后删除

- [ ] **Step 6: 实现 PUT /person/resume/{id}/default** — 设置默认简历

- [ ] **Step 7: 实现 POST /person/resume/{id}/parse** — 重新触发解析流程

- [ ] **Step 8: 实现 GET /person/resume/{id}/detail** — 返回简历详情（含解析结果）

- [ ] **Step 9: 实现 GET /person/graph** — 调用 SkillGraphClient 获取个人能力图谱

- [ ] **Step 10: 实现 GET /person/recommend/jobs** — 调用 MatchAppService 获取推荐职位

- [ ] **Step 11: 实现 GET /person/match/{jobId}** — 获取与特定职位的匹配详情

- [ ] **Step 12: 编写 PersonControllerTest（Mock AppService）**

### Task 9: 实现 ResumeController 完整逻辑

**Files:**
- Modify: `backend/src/main/java/com/graphhire/resume/interfaces/controller/ResumeController.java`
- Create: `backend/src/test/java/com/graphhire/resume/interfaces/controller/ResumeControllerTest.java`

**Steps:**
- [ ] **Step 1: 实现 ResumeController.getDetail()** — 返回简历详情（当前 stub 返回 null）

- [ ] **Step 2: 实现 ResumeController.getList()** — 返回简历分页列表（当前 stub 返回 null）

- [ ] **Step 3: 编写 ResumeControllerTest**

### Task 10: 实现 AuthAppService 完整逻辑（验证码/Token/密码重置）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/auth/application/service/AuthAppService.java`
- Modify: `backend/src/main/java/com/graphhire/auth/interfaces/controller/AuthController.java`
- Create: `backend/src/test/java/com/graphhire/auth/application/service/AuthAppServiceTest.java`

**Steps:**
- [ ] **Step 1: 实现 sendVerifyCode()** — 生成6位验证码，存入 Redis（key: email_code:{email}:{type}，15分钟有效期），调用邮件服务发送

- [ ] **Step 2: 实现 validateToken()** — 验证 refresh_token 有效性

- [ ] **Step 3: 实现 forgotPassword / resetPassword** — 发送重置验证码 + 重置密码接口

- [ ] **Step 4: 实现 logout()** — 删除 Redis 中的 Token

- [ ] **Step 5: 完善 refreshToken()** — 验证 refresh_token，删除旧 Token，生成新 Token 对

- [ ] **Step 6: 编写 AuthAppServiceTest**

### Task 11: 实现 CompanyController 完整逻辑（员工管理）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- Create: `backend/src/test/java/com/graphhire/job/interfaces/controller/CompanyControllerTest.java`

**Steps:**
- [ ] **Step 1: 实现 POST /company/staff/create** — 企业主创建员工账号（sys_user + company_staff）

- [ ] **Step 2: 实现权限校验** — 只有 OWNER 可创建 HR/RECRUITER

- [ ] **Step 3: 编写 CompanyControllerTest**

### Task 12: 实现 JobController 完整逻辑

**Files:**
- Modify: `backend/src/main/java/com/graphhire/job/interfaces/controller/JobController.java`
- Create: `backend/src/test/java/com/graphhire/job/interfaces/controller/JobControllerTest.java`

**Steps:**
- [ ] **Step 1: 补充 JobController 所有接口的业务实现** — 确保所有接口对标 03_接口设计.md

- [ ] **Step 2: 实现职位重新解析接口** — POST /company/job/{id}/parse

- [ ] **Step 3: 编写 JobControllerTest**

---

## 第三阶段：业务流程闭环

### Task 13: 实现简历解析流程（Resume → MQ → AI → 通知）

**Files:**
- Create: `backend/src/main/java/com/graphhire/resume/infrastructure/mq/ResumeParseMQConsumer.java`
- Modify: `backend/src/main/java/com/graphhire/resume/application/service/ParseAppService.java`
- Create: `backend/src/main/java/com/graphhire/notification/application/service/NotificationCreationService.java`

**Steps:**
- [ ] **Step 1: 创建 ResumeParseMQConsumer** — 监听 resume.parse 队列，调用 DocumentParser 解析文档，调用 DeepSeekClient 提取技能，更新 resume.parse_result，发送通知

- [ ] **Step 2: 完善 DocumentParser** — 集成 Apache Tika，提取 DOC/PDF 文本内容

- [ ] **Step 3: 完善 DeepSeekClient** — 实现简历解析 prompt，调用 DeepSeek API 返回结构化 JSON（姓名、技能、工作经验等）

- [ ] **Step 4: 实现 NotificationCreationService** — 创建通知并保存（type=1 简历解析完成通知）

- [ ] **Step 5: 编写 ParseAppServiceTest 和 ResumeParseMQConsumerTest（Mock 外部依赖）**

### Task 14: 实现职位解析流程

**Files:**
- Create: `backend/src/main/java/com/graphhire/job/infrastructure/mq/JobParseMQConsumer.java`
- Modify: `backend/src/main/java/com/graphhire/job/application/service/JobAppService.java`

**Steps:**
- [ ] **Step 1: 创建 JobParseMQConsumer** — 监听 job.parse 队列，类似简历解析流程

- [ ] **Step 2: 完善 JobAppService** — 职位发布后创建 parse_task，发送到 MQ

- [ ] **Step 3: 实现解析成功后更新 job.parse_result 和 job_skill 表**

- [ ] **Step 4: 编写 JobParseMQConsumerTest**

### Task 15: 实现双向匹配流程

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`
- Modify: `backend/src/main/java/com/graphhire/match/domain/service/MatchDomainService.java`
- Modify: `backend/src/main/java/com/graphhire/match/infrastructure/ai/DeepSeekClient.java`

**Steps:**
- [ ] **Step 1: 完善 MatchAppService.triggerMatchForResume()** — 简历更新后，查询所有上架职位，触发匹配

- [ ] **Step 2: 完善 MatchAppService.triggerMatchForJob()** — 职位上架后，查询所有简历，触发匹配

- [ ] **Step 3: 完善 MatchDomainService.calculateMatch()** — 调用 DeepSeek API 实现多维度匹配计算（skill_score, exp_score, city_score, edu_score, salary_score, overall_score）

- [ ] **Step 4: 实现 match_record 分数保存**

- [ ] **Step 5: 实现 type=2（职位推荐）和 type=3（候选人推荐）通知创建**

- [ ] **Step 6: 编写 MatchAppServiceTest 和 MatchDomainServiceTest**

### Task 16: 实现简历被查看通知（type=5）

**Files:**
- Modify: `backend/src/main/java/com/graphhire/match/application/service/MatchAppService.java`

**Steps:**
- [ ] **Step 1: 在企业查看候选人详情时创建 type=5 通知**

- [ ] **Step 2: 实现"同企业首次查看"去重逻辑** — 在 match_record 表加 viewed 字段，查看时更新并发送通知

### Task 17: 实现图谱构建（Memgraph 集成）

**Files:**
- Create: `backend/src/main/java/com/graphhire/skill/infrastructure/graph/SkillGraphClient.java`
- Create: `backend/src/main/java/com/graphhire/resume/application/service/GraphBuildService.java`

**Steps:**
- [ ] **Step 1: 完善 SkillGraphClient** — 实现 Memgraph 连接，创建"人-技能"和"职位-技能"节点和关系

- [ ] **Step 2: 创建 GraphBuildService** — 简历/职位解析完成后调用，构建图谱关系

- [ ] **Step 3: 实现 PersonController GET /person/graph** — 从 Memgraph 查询个人能力图谱

- [ ] **Step 4: 实现 JobController GET /company/job/{id}/graph** — 查询职位能力图谱

---

## 第四阶段：测试全覆盖

### Task 18: 单元测试补全（所有 AppService + DomainService）

**目标：** 每个 Service 方法都有对应测试，使用 Mock 避免真实数据库依赖

**Files:**
- Modify: 各模块 `src/test/java/com/graphhire/*/application/service/*AppServiceTest.java`
- Modify: 各模块 `src/test/java/com/graphhire/*/domain/service/*DomainServiceTest.java`

**测试覆盖要求：**
- AuthAppServiceTest: 登录（成功/失败/锁定）、注册、验证码、Token 刷新
- AdminAppServiceTest: 企业审核、用户禁用/启用、统计面板
- JobAppServiceTest: 职位发布/编辑/上下架、列表查询
- CompanyAppServiceTest: 企业信息更新、员工创建
- ResumeAppServiceTest: 简历上传/删除/设置默认、列表查询、详情
- PersonAppServiceTest: 个人信息查询/更新
- MatchAppServiceTest: 匹配触发、匹配详情查询
- NotificationAppServiceTest: 通知列表、未读数、标记已读
- SkillTagAppServiceTest: 技能标签 CRUD、同义词查询
- ParseAppServiceTest: 解析任务创建、状态更新

### Task 19: 集成测试（可选，连接真实 PostgreSQL/Redis）

**Files:**
- Create: `backend/src/test/java/com/graphhire/integration/` 目录

**说明：** 集成测试需要 docker-compose 环境，可选执行

### Task 20: Controller 层测试

**Files:**
- Create: `backend/src/test/java/com/graphhire/*/interfaces/controller/*ControllerTest.java`

**目标：** 每个 Controller 的主要接口都有测试（Mock AppService，不启动真实 Spring 容器）

---

## 执行说明

1. **按 Task 顺序执行**，每个 Task 内遵循 RED-GREEN-REFACTOR 节奏
2. **第一阶段优先完成** — PO/Mapper/Repository 基础设施是所有业务逻辑的根基
3. **Mock 策略** — 单元测试 Mock 所有外部依赖（DB、Redis、MQ、AI API）
4. **每个 Task 完成后提交一次** — 遵循细粒度提交原则
5. **运行命令** — `cd backend && mvn test -Dtest=xxxTest`

---

## 验收标准

1. `mvn test` 全部通过（无失败、无错误）
2. 所有 73 个接口都有对应 Controller 实现（无 stub/null 返回）
3. Repository 层测试覆盖率 > 80%（基于桩代码行数）
4. 后端服务启动成功：`mvn spring-boot:run` 无报错
5. API 文档完整（可请求到 200 响应）
