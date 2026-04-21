# GraphHire 测试策略与用例设计

> 版本: 1.0.0
> 日期: 2026-04-21
> 状态: 草稿

---

## 1. 测试策略概述

### 1.1 测试金字塔

```
                    ┌─────────────┐
                    │     E2E     │  ← Playwright (少量，关键路径)
                   ┌┴─────────────┴┐
                   │  集成测试     │  ← Spring Boot Test + MockMvc
                  ┌┴───────────────┴┐
                  │   单元测试      │  ← JUnit 5 + Mockito (大量)
                 ┌┴─────────────────┴┐
```

### 1.2 测试覆盖率目标

| 层级 | 覆盖率目标 | 测试数量估算 |
|------|-----------|-------------|
| 单元测试 | ≥ 80% | 200+ |
| 集成测试 | 核心流程全覆盖 | 50+ |
| E2E测试 | 关键用户路径 | 20+ |

### 1.3 技术栈

| 层级 | 前端 | 后端 |
|------|------|------|
| 框架 | Vitest + React Testing Library | JUnit 5 + Spring Boot Test |
| 断言 | expect (Vitest) | assertJ |
| Mock | @testing-library/user-event | Mockito |
| 集成测试 | - | MockMvc |
| E2E | Playwright | - |

---

## 2. 前端测试策略

### 2.1 单元测试方案

**测试框架**: Vitest + @testing-library/react

**测试文件位置**: `frontend/src/__tests__/` 或 `src/tests/`

**当前状态**: 已有基础测试文件 7 个

**测试规范**:

```typescript
// 命名规范
ComponentName.test.tsx        // 组件测试
moduleName.test.ts           // 工具函数测试
*.test.{ts,tsx}              // 匹配模式

// 目录结构示例
src/tests/
├── components/
│   ├── LoginForm.test.tsx
│   └── JobCard.test.tsx
├── pages/
│   ├── login.test.tsx
│   └── dashboard.test.tsx
├── hooks/
│   └── useAuth.test.ts
└── utils/
    └── formatDate.test.ts
```

**关键测试场景**:

| 模块 | 测试场景 | 测试用例数 |
|------|---------|-----------|
| 登录/注册 | 表单验证、角色切换、API调用 | 15+ |
| 简历管理 | 上传、列表、详情、删除 | 10+ |
| 职位管理 | 列表、筛选、创建、发布 | 12+ |
| 匹配功能 | 列表、详情、推荐 | 8+ |
| 通知系统 | 列表、标记已读、删除 | 6+ |
| 技能图谱 | 节点展示、交互、搜索 | 8+ |

### 2.2 集成测试方案

前端暂不设置独立的集成测试层，组件间的集成通过 E2E 测试覆盖。

### 2.3 E2E 测试方案

**测试框架**: Playwright

**测试文件位置**: `frontend/e2e/`

**关键用户路径**:

| 路径 | 测试场景 | 优先级 |
|------|---------|--------|
| 求职者流程 | 注册→登录→上传简历→查看匹配→申请职位 | P0 |
| 招聘者流程 | 注册→登录→发布职位→查看推荐→发送邀请 | P0 |
| 管理员流程 | 登录→审核企业→管理用户→系统监控 | P1 |
| 通用流程 | 登录→登出→Token刷新 | P1 |

**测试用例示例**:

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('登录流程', () => {
  test('求职者成功登录', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[placeholder="请输入用户名/邮箱"]', 'test_person@graphhire.com');
    await page.fill('[placeholder="请输入密码"]', 'Test123456');
    await page.click('button:has-text("登录")');
    await expect(page).toHaveURL('/');
  });
});
```

---

## 3. 后端测试策略

### 3.1 单元测试方案

**测试框架**: JUnit 5 + Mockito

**测试文件位置**: `backend/src/test/java/`

**当前状态**: 已有测试文件 49 个

**测试规范**:

```java
// 命名规范
ServiceNameTest.java           // 服务层测试
ControllerNameTest.java        // 控制器测试（纯单元）
RepositoryNameImplTest.java    // 仓储实现测试
*Test.java                     // 匹配模式

// IT后缀 = Integration Test
ControllerIT.java              // 集成测试
```

**分层测试策略**:

| 层 | 测试重点 | Mock策略 |
|---|---------|---------|
| Controller | 参数验证、响应结构、异常处理 | Mock service |
| Application Service | 业务逻辑、事务边界 | Mock repository |
| Domain Service | 领域规则、值对象校验 | 不 Mock domain 对象 |
| Repository | SQL 正确性、查询优化 | 使用 H2 内存数据库 |

**关键测试场景**:

| 模块 | 测试场景 | 测试用例数 |
|------|---------|-----------|
| 认证模块 | 登录、注册、Token刷新、登出 | 25+ |
| 简历模块 | 上传、解析、状态管理、图谱构建 | 20+ |
| 职位模块 | 创建、发布、筛选、下线 | 18+ |
| 匹配模块 | 触发、评分、推荐算法 | 15+ |
| 通知模块 | 发送、订阅、事件处理 | 12+ |
| 管理模块 | 企业审核、用户管理、任务监控 | 15+ |

### 3.2 集成测试方案

**测试框架**: Spring Boot Test + MockMvc

**测试基类**: `BaseControllerIT`

**特性**:
- 真实 HTTP 调用（通过 MockMvc）
- 数据库事务自动回滚
- 测试用户自动创建和清理
- 支持多角色 Token 初始化（person/company/admin）

**关键测试场景**:

| 测试类 | 测试场景 | 覆盖接口 |
|--------|---------|---------|
| `AuthControllerIT` | 登录、注册、Token | /auth/* |
| `ResumeControllerIT` | 上传、解析、查询 | /resume/* |
| `MatchControllerIT` | 匹配触发、列表 | /match/* |
| `CompanyControllerIT` | 企业CRUD、员工管理 | /company/* |
| `PersonControllerIT` | 个人信息管理 | /person/* |

### 3.3 E2E 测试方案

后端 E2E 测试通过前端 Playwright 覆盖，暂无独立的 API E2E 测试层。

---

## 4. 测试用例设计

### 4.1 前端测试用例

#### 登录页面测试

| 用例ID | 用例描述 | 前置条件 | 预期结果 |
|--------|---------|---------|---------|
| FE-LOGIN-001 | 正确账号登录 | 输入有效账号密码 | 跳转首页，显示用户信息 |
| FE-LOGIN-002 | 错误密码登录 | 输入正确账号+错误密码 | 提示"密码错误" |
| FE-LOGIN-003 | 不存在账号登录 | 输入无效账号 | 提示"用户不存在" |
| FE-LOGIN-004 | 空字段提交 | 用户名或密码为空 | 表单验证提示 |
| FE-LOGIN-005 | 角色切换 | 点击"招聘者"标签 | 切换登录角色 |
| FE-LOGIN-006 | 记住账号 | 勾选"记住账号" | 下次打开自动填充 |
| FE-LOGIN-007 | 导航到注册 | 点击"立即注册" | 跳转到注册页 |
| FE-LOGIN-008 | 忘记密码 | 点击"忘记密码？" | 跳转到找回密码页 |

#### 简历上传测试

| 用例ID | 用例描述 | 前置条件 | 预期结果 |
|--------|---------|---------|---------|
| FE-RESUME-001 | 上传PDF简历 | 选择PDF文件 | 显示上传进度，成功后展示解析结果 |
| FE-RESUME-002 | 上传DOC简历 | 选择DOC文件 | 成功解析并展示 |
| FE-RESUME-003 | 上传图片格式 | 选择JPG/PNG | 触发OCR识别 |
| FE-RESUME-004 | 上传超大文件 | 文件>10MB | 提示文件过大 |
| FE-RESUME-005 | 上传不支持格式 | 选择TXT以外格式 | 提示格式不支持 |
| FE-RESUME-006 | 解析失败处理 | 上传损坏文件 | 提示解析失败，展示原始文本 |

### 4.2 后端测试用例

#### 认证模块测试

| 用例ID | 用例描述 | 请求 | 预期结果 |
|--------|---------|------|---------|
| BE-AUTH-001 | 正常登录 | POST /auth/login {username, password} | 200 + token |
| BE-AUTH-002 | 错误密码 | POST /auth/login {username, wrongPassword} | 401 + error |
| BE-AUTH-003 | 注册发送验证码 | POST /auth/send-verify-code {email, type: register} | 200 + 验证码发送 |
| BE-AUTH-004 | 注册新用户 | POST /auth/person/register {username, password, verifyCode} | 200 + token |
| BE-AUTH-005 | 企业注册 | POST /auth/company/register {username, password, companyName, code, verifyCode} | 200 + token |
| BE-AUTH-006 | Token刷新 | POST /auth/refresh-token {refreshToken} | 200 + 新token |
| BE-AUTH-007 | 登出 | POST /auth/logout (satoken header) | 200 + 清token |
| BE-AUTH-008 | 获取当前用户 | GET /auth/current-user (satoken header) | 200 + userId |

#### 简历模块测试

| 用例ID | 用例描述 | 请求 | 预期结果 |
|--------|---------|------|---------|
| BE-RESUME-001 | 上传简历 | POST /resume/upload (multipart) | 200 + resumeId |
| BE-RESUME-002 | 获取简历列表 | GET /resume/list?userId=1 | 200 + [resumeList] |
| BE-RESUME-003 | 获取简历详情 | GET /resume/{id}/detail | 200 + resumeDetail |
| BE-RESUME-004 | 删除简历 | DELETE /resume/{id} | 200 + success |
| BE-RESUME-005 | 触发解析 | POST /resume/{id}/parse | 200 + taskId |
| BE-RESUME-006 | 查询解析状态 | GET /resume/task/{taskId}/status | 200 + status |

#### 匹配模块测试

| 用例ID | 用例描述 | 请求 | 预期结果 |
|--------|---------|------|---------|
| BE-MATCH-001 | 触发匹配 | POST /match/trigger {resumeId, jobId} | 200 + matchId |
| BE-MATCH-002 | 获取匹配详情 | GET /match/{matchId}/detail | 200 + matchDetail |
| BE-MATCH-003 | 获取简历的匹配列表 | GET /match/resume/{resumeId}/list | 200 + [matchList] |
| BE-MATCH-004 | 获取职位的匹配列表 | GET /match/job/{jobId}/list | 200 + [matchList] |

---

## 5. 测试数据管理

### 5.1 测试数据库

- **单元测试**: 使用 Mockito Mock，不连接真实数据库
- **集成测试**: 使用 Spring Boot 内嵌 H2 或连接测试库

### 5.2 测试用户

集成测试使用 `BaseControllerIT` 预置的测试账号：

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 求职者 | test_person@graphhire.com | Test123456 |
| 招聘者 | test_company@graphhire.com | Test123456 |
| 管理员 | test_admin@graphhire.com | Test123456 |

### 5.3 测试文件

| 文件 | 路径 | 用途 |
|------|------|------|
| resume-test.pdf | backend/src/test/resources/ | 简历上传测试 |
| resume-test.txt | backend/src/test/resources/ | 文本提取测试 |

---

## 6. CI/CD 集成

### 6.1 前端测试命令

```bash
# 运行测试（单次）
npm run test:run

# 运行测试（监听模式）
npm run test

# 构建检查（包含测试）
npm run build
```

### 6.2 后端测试命令

```bash
# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=AuthControllerTest

# 运行集成测试
mvn test -Dtest=*IT

# 跳过集成测试
mvn test -Dtest=!*IT
```

---

## 7. 测试执行计划

### 7.1 开发阶段

| 活动 | 负责人 | 产出 |
|------|--------|------|
| 补充前端单元测试 | 前端工程师 | 覆盖率提升至 60% |
| 补充后端单元测试 | 后端工程师 | 覆盖率提升至 70% |
| 补充集成测试 | 后端工程师 | 核心接口全覆盖 |

### 7.2 提测阶段

| 活动 | 负责人 | 标准 |
|------|--------|------|
| 执行全部单元测试 | 测试工程师 | 100% 通过 |
| 执行全部集成测试 | 测试工程师 | 100% 通过 |
| 执行 E2E 测试 | 测试工程师 | 关键路径 100% 通过 |

### 7.3 发布阶段

| 活动 | 负责人 | 标准 |
|------|--------|------|
| 测试报告生成 | 测试工程师 | 覆盖率报告 + 执行报告 |
| 回归测试 | 测试工程师 | 全部测试通过 |

---

## 8. 附录

### 8.1 现有测试文件清单

**前端测试** (`frontend/src/tests/pages/`):
- `login.test.tsx` - 登录页测试
- `match-detail.test.tsx` - 匹配详情测试
- `enterprise-dashboard.test.tsx` - 企业仪表盘测试
- `enterprise-jobs.test.tsx` - 企业职位测试
- `enterprise-employees.test.tsx` - 企业员工测试
- `enterprise-notifications.test.tsx` - 企业通知测试
- `enterprise-recommendations.test.tsx` - 企业推荐测试

**后端单元测试** (`backend/src/test/java/`):
- 49 个测试文件覆盖各模块

**后端集成测试** (`backend/src/test/java/**/it/`):
- `AuthControllerIT.java`
- `ResumeControllerIT.java`
- `MatchControllerIT.java`
- `CompanyControllerIT.java`
- `PersonControllerIT.java`
- `SkillTagControllerIT.java`
- `AdminControllerIT.java`
- `NotificationControllerIT.java`
- `PublicHomeControllerIT.java`
- `PublicJobControllerIT.java`
- `PublicCompanyControllerIT.java`

### 8.2 关键字定义

| 术语 | 定义 |
|------|------|
| 单元测试 | 对单个函数/方法/类的测试，使用 Mock 隔离依赖 |
| 集成测试 | 对多个组件协作的测试，使用真实 Spring 上下文 |
| E2E 测试 | 模拟真实用户行为的端到端测试 |
| TDD | 测试驱动开发（Test-Driven Development） |