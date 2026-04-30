# 用户/企业登录注册页替换与邮箱认证统一设计

**日期**: 2026-04-30  
**作者**: Codex  
**状态**: Approved（自治模式）

## 1. 背景与目标

当前项目 `frontend/src/app/login/page.tsx` 与 `frontend/src/app/register/page.tsx` 已具备基础认证能力，但视觉样式与 `docs/graphhire用户端新页面/src/pages/Login.tsx`、`Register.tsx` 不一致。用户要求：

1. 将用户端新页面的登录/注册视觉样式替换到现有页面。
2. 用户端与企业端共用这套登录/注册页面（通过角色切换完成分流）。
3. 注册由手机号语义改为邮箱语义，并接入发送邮箱验证码。
4. 登录页支持自动填充测试账号：求职者填充求职者账号，招聘者填充招聘者账号；注册页不自动填充。
5. 对接后端并完成编译、测试、浏览器验证。

## 2. 约束与现状

- 前端为 Next.js App Router，认证接口在 `frontend/src/lib/api/auth.ts`。
- 后端接口已提供：
  - `POST /auth/login`
  - `POST /auth/register/person`
  - `POST /auth/register/company`
  - `POST /auth/send-verify-code?email=...&type=register`
- 后端注册 DTO 已要求邮箱格式；登录 DTO 目前仅 `@NotBlank`，语义仍为 `username`。
- 登录角色分流规则由 `resolveLoginRoleDecision` 控制，现有逻辑可复用。

## 3. 方案比较

### 方案 A（推荐）：保留现有路由与认证逻辑，仅替换登录/注册页面结构与样式

- 做法：以 `docs/graphhire用户端新页面` 的 UI 为视觉基线，迁移到 Next 页面；保留现有 API 调用与角色分流。
- 优点：风险最小、改动集中、联调成本低。
- 缺点：与 docs 代码不会逐行一致，而是“视觉一致 + 业务可用”的工程化版本。

### 方案 B：将 docs 页面整体搬入 `features` 再通过桥接适配 Next

- 优点：最大程度复用 docs 代码。
- 缺点：引入 React Router 适配成本，重复抽象较多，不必要复杂。

### 方案 C：新建独立 auth 模块并重构现有认证状态流

- 优点：长期可扩展。
- 缺点：超出本次需求范围，交付慢且风险高。

**结论**：采用方案 A。

## 4. 目标设计

### 4.1 页面与交互

- 登录页：采用 docs 登录页的卡片式视觉（背景装饰 + 双角色 Tab + 邮箱/密码输入 + 登录按钮）。
- 注册页：采用 docs 注册页视觉结构（角色切换、企业附加字段、邮箱验证码、密码确认、协议勾选）。
- 用户端/企业端统一入口：仍使用同一个 `/login` 与 `/register` 页面，通过角色切换实现。

### 4.2 认证与后端对接

- 登录请求字段仍为后端 `username`，但前端语义统一为邮箱输入。
- 注册请求保持：`username=email`、`verifyCode`、企业附加信息。
- 发送验证码调用 `authApi.sendVerifyCode(email, 'register')`，并保留倒计时防连点。
- 企业注册返回“审核中”类业务异常时，保持当前“提示后跳转登录页”的行为。

### 4.3 自动填充

- 仅登录页自动填充：
  - 求职者：`13800138001@phone.com / password123`
  - 招聘者：`hr@techchina.com / password123`
- 切换角色时自动替换为对应测试账号。
- 注册页默认空表单。

### 4.4 后端语义统一

- 将 `LoginRequest` 增加 `@Email` 校验，提示文案改为“邮箱不能为空/邮箱格式不正确”，与项目“邮箱登录”语义一致。
- Controller/注释中的“用户名”描述改为“邮箱”。

### 4.5 测试策略

- 前端：
  - 更新并补充 `login.test.tsx`（邮箱输入、角色切换自动填充、核心文案与链接）。
  - 新增 `register.test.tsx`（邮箱验证码发送、角色切换企业字段显示、基础校验）。
- 后端：
  - 新增 `LoginRequestTest`，验证邮箱校验规则。
- 集成验证：
  - 前端 `npm run build`、`npm run test:run`
  - 后端 `mvn compile`、`mvn test`
  - CDP 浏览器验证登录/注册页面关键流程。

## 5. 错误处理

- 邮箱为空/格式错误：前端先校验并提示，后端再兜底校验。
- 验证码发送失败：展示后端返回错误，不清空已输入邮箱。
- 登录角色不匹配：继续使用 `resolveLoginRoleDecision` 提示。
- 企业注册审核中：显示蓝色提示并延迟跳转登录页。

## 6. 变更边界

- 仅修改认证页与认证请求语义相关文件，不改业务域模型。
- 不新增数据库迁移，不改鉴权协议。

## 7. 验收映射

本设计对应验收文档：
`docs/superpowers/acceptance/2026-04-30-145228-auth-email-login-register-acceptance.md`
