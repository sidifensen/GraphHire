# Acceptance Criteria: 前端 Mock 壳重建与真实认证接入

**Spec:** `docs/superpowers/specs/2026-04-30-101900-frontend-mock-shell-rebuild-design.md`
**Date:** 2026-04-30
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 登录页以邮箱和密码作为唯一登录表单输入，不再展示手机号登录文案或手机号表单字段 | UI interaction | 前端开发服务器启动并打开 `/login` | 页面显示求职者 / 招聘者角色切换、邮箱输入框、密码输入框；页面中不存在“手机号登录”相关文案 |
| AC-002 | 求职者登录成功时，前端调用真实登录接口并跳转到用户端首页 | UI interaction | `authApi.login` 可返回 `userType=PERSON` 的成功结果；打开 `/login` 并切换到求职者 | 提交邮箱和密码后发起一次 `/auth/login` 请求，请求体中的 `username` 为输入邮箱；登录成功后跳转到 `/` |
| AC-003 | 招聘者登录成功时，前端调用真实登录接口并跳转到企业端工作台 | UI interaction | `authApi.login` 可返回 `userType=COMPANY` 的成功结果；打开 `/login` 并切换到招聘者 | 提交邮箱和密码后发起一次 `/auth/login` 请求，请求体中的 `username` 为输入邮箱；登录成功后跳转到 `/enterprise/dashboard` |
| AC-004 | 登录入口角色与后端返回角色不匹配时，页面给出明确错误提示且不跳转 | UI interaction | 打开 `/login`；当前角色切换为求职者或招聘者；`authApi.login` 返回相反的 `userType` | 页面显示“角色与入口不匹配”类错误提示；当前路由保持在 `/login` |
| AC-005 | 注册页发送验证码时，前端调用真实邮箱验证码接口 | UI interaction | 前端开发服务器启动并打开 `/register`；填写合法邮箱 | 点击发送验证码后发起一次 `POST /auth/send-verify-code` 请求，请求参数包含 `email=<输入邮箱>` 和 `type=register` |
| AC-006 | 求职者注册成功时，前端调用个人注册接口并进入用户端首页 | UI interaction | 打开 `/register`；切换到求职者；填写邮箱、验证码、密码、确认密码；`authApi.personRegister` 返回成功 | 页面发起一次 `POST /auth/register/person` 请求，请求体中的 `username` 为输入邮箱；注册成功后跳转到 `/` |
| AC-007 | 招聘者注册成功时，前端调用企业注册接口并进入企业端工作台 | UI interaction | 打开 `/register`；切换到招聘者；填写邮箱、验证码、密码、确认密码、企业名称、统一社会信用代码；`authApi.companyRegister` 返回成功 | 页面发起一次 `POST /auth/register/company` 请求，请求体中的 `username` 为输入邮箱，并包含企业字段；注册成功后跳转到 `/enterprise/dashboard` |
| AC-008 | 企业注册遇到审核中响应时，页面展示审核提示并回到登录页待审状态 | UI interaction | 招聘者注册请求返回“该公司正在审核中，暂不可进入企业端”类错误信息 | 页面显示企业审核提示；随后跳转到 `/login?review=pending` |
| AC-009 | 用户端公开页面迁移后全部依赖本地 mock 数据，不再在渲染时请求首页、职位、公司、简历、通知和图谱真实业务接口 | Logic | 运行前端测试或检查用户端页面实现 | `frontend/src/app/page.tsx`、`frontend/src/app/(user)/**` 的页面实现不再调用 `homeApi`、`publicApi`、`personApi`、`resumeApi`、`notificationApi`、`matchApi` 这些业务数据接口；页面可仅依赖本地 mock feature 模块渲染 |
| AC-010 | 企业端公开页面迁移后全部依赖本地 mock 数据，同时保留企业身份守卫 | Logic | 运行前端测试或检查企业端页面实现 | `frontend/src/app/enterprise/**` 的业务页不再调用 `companyApi`、`notificationApi` 读取业务数据；`frontend/src/app/enterprise/layout.tsx` 仍包裹企业鉴权守卫并在未授权时拒绝进入 |
| AC-011 | 项目中不再保留移动端内部路由目录与移动端 rewrite 逻辑 | Logic | 代码改造完成后检查仓库文件与导出 | `frontend/src/app/mobile-user`、`frontend/src/app/mobile-enterprise`、`frontend/src/lib/device-routing.ts`、`frontend/middleware.ts`、`frontend/src/proxy.ts` 不再存在或不再包含移动端 rewrite 逻辑 |
| AC-012 | 项目中不再保留依赖移动端内部路由的测试 | Logic | 代码改造完成后检查 `frontend/tests` 与 `frontend/src/tests` | 不再存在 `mobile-user`、`mobile-enterprise`、`device-routing` 相关前端测试文件或测试用例引用 |
| AC-013 | 用户端首页和企业端工作台能够在 Next 路由下渲染迁移后的 mock 页面核心文案 | UI interaction | 前端开发服务器启动；分别访问 `/` 和 `/enterprise/dashboard` | `/` 页面能看到迁移后的用户端首页核心标题或首屏模块；`/enterprise/dashboard` 页面能看到迁移后的企业端工作台核心标题或数据区块 |
| AC-014 | 前端验证阶段仅要求前端测试、前端构建和浏览器验收通过，不要求执行后端编译与后端测试 | Logic | 执行本次任务的完成验证 | 完成说明和验证记录中包含 `frontend` 的 `npm run test:run`、`npm run build` 和 CDP 浏览器验证结果；不要求运行 `backend` 的 `mvn compile` 或 `mvn test` |

