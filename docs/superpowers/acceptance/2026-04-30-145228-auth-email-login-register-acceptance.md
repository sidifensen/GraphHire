# Acceptance Criteria: 登录注册页样式替换与邮箱认证统一

**Spec:** `docs/superpowers/specs/2026-04-30-145228-auth-email-login-register-design.md`  
**Date:** 2026-04-30  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | `/login` 页面呈现为 docs 用户端新页面风格（卡片布局、角色切换、邮箱与密码输入） | UI interaction | 前端服务运行于 `http://localhost:8888` | 打开 `/login` 可见“求职者/招聘者”切换、邮箱输入框、登录按钮且页面无报错 |
| AC-002 | 登录页切换到招聘者后自动填充招聘者测试账号 | UI interaction | 打开 `/login`，默认在求职者 tab | 点击“招聘者”后邮箱与密码自动变为 `hr@techchina.com / password123` |
| AC-003 | 登录页切回求职者后自动填充求职者测试账号 | UI interaction | 已在 `/login` 的招聘者 tab | 点击“求职者”后邮箱与密码自动变为 `13800138001@phone.com / password123` |
| AC-004 | 注册页不自动填充测试账号 | UI interaction | 打开 `/register` | 邮箱、验证码、密码、确认密码字段默认均为空 |
| AC-005 | 注册页采用邮箱输入并支持发送邮箱验证码 | UI interaction | 打开 `/register`，输入合法邮箱 | 点击“获取验证码”后触发 `/auth/send-verify-code` 请求，按钮进入倒计时 |
| AC-006 | 注册页切换到招聘者时显示企业附加字段 | UI interaction | 打开 `/register` | 切换角色为招聘者后显示公司名称、统一社会信用代码输入项 |
| AC-007 | 用户端和企业端共用同一登录入口并由角色分流 | Logic | 前端单一路由 `/login` 存在 | 登录逻辑根据角色与返回 `userType` 分别写入 `userAuthStore` 或 `enterpriseAuthStore` 并跳转对应页面 |
| AC-008 | 后端登录请求按邮箱语义校验 | Logic | 后端单元测试可执行 | `LoginRequest` 空邮箱或非邮箱格式会触发 Bean Validation 失败 |
| AC-009 | 前端单元测试覆盖登录与注册关键交互 | Logic | 执行 `npm run test:run` | 登录/注册新增或更新的测试通过，且包含自动填充与邮箱注册关键断言 |
| AC-010 | 后端编译与测试通过 | Logic | 执行 `mvn compile` 与 `mvn test` | 两个命令均退出码 0 |
| AC-011 | 前端构建通过 | Logic | 执行 `npm run build` | 构建命令退出码 0 |
| AC-012 | CDP 浏览器验证通过 | UI interaction | 使用 chrome-devtools 打开页面 | 实测 `/login`、`/register` 页面可交互，关键流程与样式正常 |
