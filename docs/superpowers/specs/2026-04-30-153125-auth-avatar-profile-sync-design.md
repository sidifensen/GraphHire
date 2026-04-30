# 用户登录态头像与名称展示设计（求职者端/招聘者端）

**日期**: 2026-04-30  
**作者**: Codex  
**范围**: frontend（Next.js App Router + mock shell）

---

## 1. 背景与目标

当前系统已完成账号注册/登录与本地持久化（`zustand persist`），但当前生效导航（`app/(user)/_mock/components/Navbar.tsx` 与 `app/enterprise/_mock/components/TopNav.tsx`）仍显示固定入口或默认人像，未绑定真实登录用户信息；`app/(user)/profile/page.tsx` 仍为静态假数据。

本次目标：
1. 用户注册/登录后，求职者端与招聘者端右上角都展示“头像 + 名称”。
2. 页面刷新后保持登录态并继续展示对应信息。
3. 求职者个人主页显示当前登录用户对应资料（姓名、邮箱/账号、头像等），不再使用硬编码身份。

---

## 2. 方案对比与选择

### 方案 A（推荐）：前端会话增量补全
- 登录/注册成功时先写入基础身份（`userId/username/userType/token`）。
- 在导航组件挂载后基于当前域拉取资料：
  - 求职者：`GET /person/info`
  - 招聘者：`GET /company/info`
- 将真实显示名和头像 URL 回填到对应 `auth-store`。

优点：
- 不改后端登录协议，风险低。
- 与现有分域存储（user/enterprise）自然兼容。
- 失败可降级为账号名 + 默认头像，不阻塞核心流程。

缺点：
- 首次登录到展示真实头像存在一次异步更新。

### 方案 B：改后端登录返回完整用户信息
- 在 `/auth/login` 与注册接口直接返回 displayName/avatar。

优点：
- 前端首屏即可完整显示，无二次请求。

缺点：
- 需改后端 DTO 与聚合查询，涉及联表与跨域实体装配，影响面更大。

### 方案 C：页面级独立查询，不回填 store
- 每个页面单独请求资料并局部渲染。

优点：
- 单点实现快。

缺点：
- 逻辑分散、重复请求、状态不一致风险高。

**结论**：采用方案 A。

---

## 3. 详细设计

### 3.1 状态模型
扩展 `auth-store` 的用户结构，增加可选展示字段：
- `displayName?: string`

展示规则：
- 名称：`displayName ?? username`
- 头像：`avatarUrl ?? 默认头像`

### 3.2 求职者端头部（Navbar）
修改 `app/(user)/_mock/components/Navbar.tsx`：
- 登录状态：展示通知入口 + “名称 + 头像”按钮。
- 未登录状态：保留“登录 / 注册”入口。
- 在 `useEffect` 中对已登录用户调用 `personApi.getProfile()`。
- 若返回 `realName/avatarUrl`，回填 `userAuthStore.updateUser()`。

### 3.3 招聘者端头部（TopNav）
修改 `app/enterprise/_mock/components/TopNav.tsx`：
- 右上角新增名称文本（优先企业名）与头像。
- 在 `useEffect` 中对已登录企业用户调用 `companyApi.getInfo()`。
- 将 `company.name` 回填为 `displayName`，`company.avatarUrl/logo` 回填头像。

### 3.4 求职者个人主页
修改 `app/(user)/profile/page.tsx`：
- 页面加载时读取 `userAuthStore` 当前用户基础身份。
- 并行请求 `personApi.getProfile()`，优先显示 `realName`、`email`、`avatarUrl`。
- 无资料时降级显示账号名与默认头像。
- 退出登录按钮改为走现有 `logoutWithServerInvalidation`，避免仅跳路由不清会话。

### 3.5 错误处理与回退
- 资料 API 失败：不打断页面渲染，静默降级为 store 内基础用户名与默认头像。
- 头像加载失败：切换默认头像图标。

---

## 4. 数据流

1. 登录/注册 -> 写入 token + 基础 user（persist）。
2. 导航组件识别已登录 -> 请求 profile/company info。
3. store 增量更新 displayName/avatarUrl。
4. 头部与个人主页订阅 store，自动渲染新数据。
5. 刷新页面后，由 persist 恢复基础会话，再次异步补全最新资料。

---

## 5. 测试策略

1. 组件测试（RED-GREEN）
- Navbar：已登录时显示 store 名称与头像，未登录时显示登录入口。
- Enterprise TopNav：已登录企业用户显示名称与头像。
- Profile：展示来自 profile API / store 的对应用户信息。

2. 回归测试
- 保持现有登录/注册页测试通过。

3. 构建与集成验证
- `npm run build`
- `npm run test:run`

---

## 6. 风险与边界

- 当前用户端和企业端页面仍处于 mock-shell 形态，本次只修复“登录态身份展示”链路，不扩展到所有业务页面的真实数据替换。
- 若后续希望登录即返回完整身份，可在后端演进为方案 B，前端兼容不破坏。
