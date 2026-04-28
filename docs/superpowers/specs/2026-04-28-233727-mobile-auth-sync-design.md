# 移动端登录注册真实接口对接与桌面端表单对齐设计

**日期**: 2026-04-28  
**范围**: `frontend/src/app/mobile-user/login/page.tsx`、`frontend/src/app/mobile-user/register/page.tsx` 及对应测试

## 背景与目标

当前移动端登录/注册页面仍是静态演示实现：登录仅本地跳转、注册不调用后端。桌面端 `login/register` 已具备真实鉴权流程、角色识别、错误处理与企业审核提示。  
本次目标是让移动端登录/注册具备与桌面端一致的核心行为，并满足：

1. 移动端登录接入真实 `authApi.login`；
2. 移动端注册接入真实 `authApi.sendVerifyCode/personRegister/companyRegister`；
3. 移动端登录表单结构与交互语义对齐桌面端（角色切换 + 账号/密码提交 + 错误提示）；
4. 角色切换时自动填充测试账号：求职者填求职者测试账号，招聘者填招聘者测试账号；
5. 登录/注册成功后写入对应鉴权 store 并跳转到正确页面。

## 方案选型

### 方案 A（推荐）：复用桌面端业务逻辑，保留移动端视觉壳
- 在移动页直接引入与桌面一致的 API、角色决策与 store 写入逻辑；
- UI 保持移动端布局，仅将关键字段和行为调整为桌面一致语义。

优点：改动小、行为一致、风险低。  
缺点：移动端与桌面端仍存在部分重复逻辑。

### 方案 B：抽离共享 `auth form hook`
- 新建共享 hook/组件统一登录注册逻辑，再让桌面/移动共同消费。

优点：长期复用性好。  
缺点：超出本次需求，改动面大，回归风险高。

### 方案 C：移动端直接复用桌面组件并通过样式覆盖
- 将桌面组件嵌入移动页面并做响应式收敛。

优点：视觉和行为高度一致。  
缺点：移动端可读性与维护成本差，不符合当前路由分层。

结论：采用 **方案 A**。

## 详细设计

### 1. 移动端登录页

- 角色枚举对齐桌面端：`jobseeker | recruiter`；
- 增加测试账号常量：
  - 求职者：`13800138001@phone.com / password123`
  - 招聘者：`hr@techchina.com / password123`
- 角色切换行为：
  - 切换后立即用对应测试账号覆盖用户名/密码输入框；
- 提交流程：
  - 调 `authApi.login({ username, password })`；
  - 用 `resolveLoginRoleDecision` 校验选中角色与返回 `userType` 是否匹配；
  - `COMPANY` 写入 `enterpriseAuthStore` 并跳 `/enterprise/dashboard`；
  - `PERSON` 写入 `userAuthStore` 并跳 `/`；
  - 角色不匹配时显示明确错误。
- 异常处理：
  - 使用 `err instanceof Error ? err.message : 默认文案`；
  - 失败后不跳转，保持当前输入。

### 2. 移动端注册页

- 保留角色切换，但角色值对齐为 `jobseeker | recruiter`；
- 字段与桌面端核心一致：
  - 通用：邮箱、验证码、密码、确认密码、协议勾选；
  - 招聘者额外：公司名称、统一社会信用代码；
- 验证码发送：
  - 调 `authApi.sendVerifyCode(email, 'register')`；
  - 成功后进入 60s 倒计时；
- 提交流程：
  - 前端校验规则与桌面端一致（必填、密码长度、两次密码一致、协议勾选、企业字段必填）；
  - 求职者调 `personRegister`，招聘者调 `companyRegister`；
  - 成功后按 `userType` 写入对应 store 并跳转；
  - 企业审核中场景提示后跳到 `/login?review=pending`。

### 3. 测试策略（TDD）

- 新增移动页测试文件，先写失败测试覆盖：
  - 登录页角色切换会预填对应测试账号；
  - 登录成功调用 `authApi.login` + 对应 store `setAuth` + 正确跳转；
  - 注册页招聘者模式提交时调用 `companyRegister`；
  - 注册页验证码发送失败显示后端错误；
- 再实现最小代码通过测试，最后小幅重构去重。

## 风险与回退

- 风险：移动端原有静态文案/样式可能因字段调整出现快照波动；  
- 缓解：测试优先关注行为断言，不依赖脆弱样式断言。  
- 回退：单点回退仅涉及 `mobile-user/login` 与 `mobile-user/register` 两个页面和新增测试文件。
