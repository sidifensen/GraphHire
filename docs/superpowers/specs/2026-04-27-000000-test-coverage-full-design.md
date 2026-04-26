# 测试全覆盖设计文档

## 目标

给 GraphHire 项目所有后端接口和前端页面补齐测试，达到 100% 测试覆盖率。

## 范围

### 后端测试 (18 Controller, 130+ 接口)

| 模块 | Controller | 接口数 | 现状 |
|------|-----------|--------|------|
| 认证 | AuthController | 11 | 已有 IT + Unit |
| 认证 | PasswordController | 2 | 需补充 |
| 企业 | CompanyController | 32 | 已有 IT + Unit |
| 用户 | PersonController | 6 | 已有部分 |
| 用户 | PersonAvatarController | 3 | 已有部分 |
| 简历 | ResumeController | 9 | 已有 IT + Unit |
| 匹配 | MatchController | 5 | 已有部分 |
| 匹配 | MatchGraphController | 1 | 无测试 |
| 技能 | SkillTagController | 9 | 已有 IT |
| 申请 | PersonApplicationController | 7 | 缺 Controller IT |
| 申请 | CompanyApplicationController | 10 | 缺 Controller IT |
| 通知 | NotificationController | 14 | 已有 IT |
| 管理 | AdminController | 19 | 已有 IT + Unit |
| 管理 | AdminUserController | 1 | 无测试 |
| 管理 | AdminSettingsController | 2 | 无测试 |
| 公开 | PublicHomeController | 1 | 已有 IT |
| 公开 | PublicJobController | 2 | 已有 IT |
| 公开 | PublicCompanyController | 2 | 已有 IT |

**缺口**：PasswordController, MatchGraphController, PersonApplicationController, CompanyApplicationController, AdminUserController, AdminSettingsController

### 前端测试 (30 页面 + 23 组件)

| 分类 | 页面数 | 测试现状 |
|------|--------|----------|
| 认证页 | 3 | 需补充 /admin/login |
| 管理后台 | 7 | 已有 /admin/dashboard |
| 企业端 | 6 | 部分覆盖 |
| 用户端 | 14 | 部分覆盖 |

**缺口**：所有页面的完整测试覆盖

## 测试分层策略

### 后端
- **Controller 层**：Spring Boot Integration Test (@WebMvcTest + MockMvc)，真实 HTTP 模拟
- **Service 层**：JUnit 5 + Mockito 单元测试
- **外部依赖**：全面 Mock（DeepSeek API、Aliyun OSS、Redis）

### 前端
- **页面测试**：Vitest + React Testing Library，msw Mock HTTP
- **组件测试**：关键 UI 组件单元测试
- **API Mock**：msw (Mock Service Worker)

## 测试文件结构

```
backend/src/test/java/com/graphhire/
├── controllerIT/
│   ├── PasswordControllerIT.java         [新增]
│   ├── MatchGraphControllerIT.java      [新增]
│   ├── PersonApplicationControllerIT.java [新增]
│   ├── CompanyApplicationControllerIT.java [新增]
│   ├── AdminUserControllerIT.java       [新增]
│   └── AdminSettingsControllerIT.java   [新增]
└── service/

frontend/tests/
├── pages/
│   ├── admin/
│   │   ├── login.test.tsx               [新增]
│   │   ├── users.test.tsx               [新增]
│   │   ├── skill-tags.test.tsx          [新增]
│   │   ├── enterprise-review.test.tsx  [新增]
│   │   ├── task-monitor.test.tsx        [新增]
│   │   └── settings.test.tsx            [新增]
│   ├── enterprise/
│   │   ├── dashboard.test.tsx            [新增]
│   │   ├── jobs.test.tsx                [新增]
│   │   ├── jobs-new.test.tsx            [新增]
│   │   ├── jobs-id.test.tsx             [新增]
│   │   ├── jobs-id-edit.test.tsx        [新增]
│   │   └── employees.test.tsx           [新增]
│   └── user/
│       ├── jobs.test.tsx                [新增]
│       ├── jobs-id.test.tsx             [新增]
│       ├── companies.test.tsx           [新增]
│       ├── companies-id.test.tsx        [新增]
│       ├── profile.test.tsx             [已有,补充]
│       ├── resume-upload.test.tsx       [已有,补充]
│       ├── resume-manage.test.tsx       [新增]
│       ├── applications.test.tsx        [新增]
│       ├── notifications.test.tsx       [新增]
│       └── skill-graph.test.tsx         [新增]
└── components/
```

## 实施顺序

1. **后端缺口 Controller IT**（6 个）
2. **前端页面测试**（30 个页面）
3. **验证** - 运行全部测试确保通过

## 验收标准

1. 后端所有 Controller 都有 IT 测试
2. 前端所有页面都有测试文件
3. `mvn test` 和 `npm run test:run` 全部通过
4. `npm run build` 和 `mvn compile` 成功
