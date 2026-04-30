# 前端 Mock 壳重建与真实认证接入设计

## 目标

将前端收敛为“真实认证 + mock 业务页面”的单一 Next.js 实现：

- 用户端页面使用 `docs/graphhire用户端新页面` 作为视觉与结构蓝本
- 企业端页面使用 `docs/graphhire企业端新页面` 作为视觉与结构蓝本
- 除登录/注册外，所有业务页先只使用 mock 数据
- 登录与注册继续对接当前后端认证接口
- 根据求职者 / 招聘者的登录方式进入用户端 / 企业端
- 删除全部手机版目录、路由重写和相关组件逻辑

## 非目标

- 本次不改后端接口
- 本次不补企业端或用户端的真实业务接口接入
- 本次不做后台管理端改造
- 本次不做移动端适配保留；移动端相关实现直接移除

## 约束与事实

### 1. 认证接口的真实能力

后端当前提供：

- `POST /auth/login`：`username + password`
- `POST /auth/register/person`
- `POST /auth/register/company`
- `POST /auth/send-verify-code`：邮箱验证码发送
- `GET /auth/context`：登录后真实角色上下文

后端当前不提供：

- 邮箱验证码登录

因此前端必须按真实能力实现：

- 登录：邮箱 + 密码
- 注册：邮箱 + 验证码 + 密码

### 2. 路由策略

为减少回归范围，保留现有公开 URL，不把前端切回原型里的 React Router 命名。

原型命名与正式 URL 的映射通过 Next 页面实现，而不是改公开路径。

### 3. 页面数据策略

- 认证页：真实后端
- 其余用户端 / 企业端业务页：本地 mock 数据

## 方案比较

### 方案 A：保留现有公开 URL，仅替换页面内容与数据源

做法：

- 保持 `/`、`/jobs`、`/enterprise/jobs` 等 URL 不变
- 将原型页面改写为 Next 组件并挂到现有路由
- 登录注册继续走现有 auth API
- 其余页改用本地 mock 数据

优点：

- 变更面最小
- 当前登录跳转、布局入口、测试路径更容易延续
- 不需要同时做路由语义迁移

缺点：

- 需要对原型里的部分链接和路径命名做适配

### 方案 B：整体切换到原型路由命名

做法：

- 用户端改用 `/resume`、`/graph`、`/personal-info`
- 企业端改用 `/team`、`/messages`、`/candidate/:id`

优点：

- 更贴近原型原始结构

缺点：

- 公开 URL 全面变动
- 现有登录落地、导航跳转和测试都要一起改
- 回归范围明显更大

### 方案 C：只保留登录注册，其他页面整体重搭一个新应用壳

做法：

- 登录注册仍留在当前项目
- 用户端和企业端页面另起一套新路由分区

优点：

- 对旧页面干扰较小

缺点：

- 会留下两套并存页面
- 与“直接把当前前端弄好”的目标相反

### 推荐

采用方案 A。

它最符合“前端先搭起来、后端暂时不动、只保留真实认证、其他页面先 mock”的要求，也最适合一次性删掉移动端链路。

## 路由映射设计

### 一、用户端

| 当前公开路由 | 新实现来源 | 数据源 | 说明 |
| --- | --- | --- | --- |
| `/` | 原型 `Home.tsx` | mock | 作为用户端首页 |
| `/jobs` | 原型 `JobList.tsx` | mock | |
| `/jobs/[id]` | 原型 `JobDetail.tsx` | mock | |
| `/companies` | 原型 `CompanyList.tsx` | mock | |
| `/companies/[id]` | 原型 `CompanyDetail.tsx` | mock | |
| `/profile` | 原型 `Profile.tsx` | mock | |
| `/resume/manage` | 原型 `ResumeManagement.tsx` | mock | 保留旧 URL |
| `/resume/upload` | 新增 Next mock 页 | mock | 不直接对应原型，保留最小可用上传展示 |
| `/applications` | 原型 `ApplicationRecords.tsx` | mock | |
| `/notifications` | 原型 `Notifications.tsx` | mock | |
| `/skill-graph` | 原型 `KnowledgeGraph.tsx` | mock | 保留旧 URL，对应原型 `/graph` |
| `/personal-info` | 原型 `PersonalInfo.tsx` | mock | 新增公开路由，供 profile 菜单跳转 |

### 二、企业端

| 当前公开路由 | 新实现来源 | 数据源 | 说明 |
| --- | --- | --- | --- |
| `/enterprise/dashboard` | 原型 `Dashboard.tsx` | mock | |
| `/enterprise/jobs` | 原型 `Jobs.tsx` | mock | |
| `/enterprise/jobs/new` | 原型 `JobCreate.tsx` | mock | 将原型 `/jobs/create` 映射到现有 URL |
| `/enterprise/jobs/[id]` | 原型 `JobDetail.tsx` | mock | |
| `/enterprise/jobs/[id]/edit` | 原型 `JobEdit.tsx` | mock | |
| `/enterprise/recommendations` | 原型 `Recommendations.tsx` | mock | |
| `/enterprise/employees` | 原型 `Team.tsx` | mock | 将原型 `/team` 映射到现有 URL |
| `/enterprise/notifications` | 原型 `Messages.tsx` | mock | 将原型 `/messages` 映射到现有 URL |
| `/enterprise/candidates/[id]` | 原型 `CandidateDetail.tsx` | mock | 新增路由，承接原型候选人详情链接 |

## 认证流设计

### 一、登录页

复用现有 `frontend/src/app/login/page.tsx` 的企业风格布局，保留双角色切换：

- 求职者
- 招聘者

表单模型：

- `email`
- `password`

请求策略：

- 登录请求仍调用 `authApi.login({ username: email, password })`

成功后分流：

- `PERSON` -> `/`
- `COMPANY` -> `/enterprise/dashboard`

角色校验策略：

- 若当前切换为求职者，但后端返回 `COMPANY`，则提示角色与入口不匹配
- 若当前切换为招聘者，但后端返回 `PERSON`，同样提示不匹配
- `ADMIN` 不在本次登录入口承接范围内，继续提示使用管理员入口

### 二、注册页

复用现有 `frontend/src/app/register/page.tsx` 的企业风格布局。

表单模型：

- 求职者：
  - `email`
  - `verifyCode`
  - `password`
  - `confirmPassword`
- 招聘者：
  - 上述字段
  - `companyName`
  - `unifiedSocialCreditCode`

验证码策略：

- 发送验证码调用 `authApi.sendVerifyCode(email, 'register')`

注册成功后分流：

- `PERSON` -> `/`
- `COMPANY` -> `/enterprise/dashboard`
- 若企业端返回审核提示错误，沿用当前审核中提示逻辑

## 移动端移除设计

### 一、删除目录

- `frontend/src/app/mobile-user/**`
- `frontend/src/app/mobile-enterprise/**`

### 二、删除路由重写

- `frontend/middleware.ts`
- `frontend/src/proxy.ts`
- `frontend/src/lib/device-routing.ts`

### 三、删除移动端专属测试

- `frontend/src/tests/app/mobile-user-*`
- `frontend/src/tests/app/mobile-enterprise-*`
- `frontend/src/tests/lib/device-routing.test.ts`
- `frontend/tests/pages/mobile-user-login.test.tsx`
- `frontend/tests/pages/mobile-user-register.test.tsx`

### 四、删除移动端专属组件与样式引用

- 用户端原型迁移后不保留 `BottomNav`
- 企业端原型迁移后不保留 `BottomNav`
- 不保留任何 `MobileLayout` / `MobileShell` 运行时壳

## 实现结构设计

### 一、用户端实现组织

新增独立 mock 域，例如：

```text
frontend/src/features/mock-user/
  data/
  components/
  pages/
```

职责：

- `data`：承载从原型迁移过来的 mock 数据和类型
- `components`：承载原型导航、通用卡片、筛选器、骨架等可复用组件
- `pages`：承载按 Next 路由封装后的页面组件

### 二、企业端实现组织

```text
frontend/src/features/mock-enterprise/
  data/
  components/
  pages/
```

职责与用户端一致。

### 三、Next 路由页职责

`src/app/**/page.tsx` 只做三类事：

1. 读取动态路由参数
2. 组装对应 mock page 组件
3. 处理必要的 URL 适配

页面主体逻辑和视觉结构下沉到 `features/mock-*` 中，避免把 `app` 目录继续堆成大文件。

## 布局设计

### 一、用户端

不再沿用当前 `Header + Sidebar + Footer` 桌面壳。

改为新 mock 用户壳：

- 顶部导航来源于原型 `Navbar.tsx`
- 去掉底部导航
- 页面内容宽度、桌面留白、分区标题沿用原型风格

### 二、企业端

不再沿用当前 `EnterpriseHeader` 的旧导航结构。

改为新 mock 企业壳：

- 顶部导航来源于原型 `TopNav.tsx`
- 去掉底部导航
- 继续保留 `EnterpriseAuthGuard`
- 企业端业务页全部走新的 mock 顶部导航与桌面容器

## 测试设计

### 一、认证页

先写失败测试覆盖：

- 登录页提交邮箱和密码后调用 `authApi.login`
- 根据 `userType` 分流到 `/` 或 `/enterprise/dashboard`
- 注册页发送邮箱验证码调用 `authApi.sendVerifyCode`
- 求职者注册调用 `authApi.personRegister`
- 招聘者注册调用 `authApi.companyRegister`

### 二、移动端移除

先写失败测试覆盖：

- 不再存在移动端 rewrite
- 不再存在 `device-routing` 映射导出
- 不再渲染移动端内部路由目录页面

### 三、关键路由渲染

至少覆盖：

- 用户端首页能够渲染 mock 首页关键文案
- 企业端 dashboard 能够渲染 mock 工作台关键文案
- 企业端 employees/notifications 能映射到新原型的 `Team` / `Messages`

## 验证设计

本次只做前端验证：

- `frontend`：`npm run test:run`
- `frontend`：`npm run build`
- 浏览器验证：通过 CDP 打开登录页、注册页、用户端首页、企业端 dashboard

后端编译与后端测试不在本次范围内。

## 风险与控制

### 风险一：原型组件直接搬运后仍带移动端交互残留

控制：

- 迁移时显式删掉 `BottomNav`
- 页面组件中不再保留移动端 route 判断

### 风险二：原型页面依赖 React Router API

控制：

- 统一改为 `next/link`、`next/navigation`
- 路由参数通过 Next 动态路由传入

### 风险三：原型页面依赖 mock 数据结构与现有类型冲突

控制：

- mock 域单独定义类型，不复用现有真实业务 API type

### 风险四：登录注册与 mock 页面混用导致旧鉴权壳失效

控制：

- 登录 / 注册继续走当前 auth store
- 企业端布局继续保留 `EnterpriseAuthGuard`
- 用户端公开页暂不加额外强制鉴权

## 实施顺序

1. 先补认证与移动端移除的失败测试
2. 清理移动端 rewrite、目录和相关测试
3. 搭建用户端 / 企业端 mock features 目录
4. 逐页把原型页面迁移为 Next 组件
5. 接入登录注册真实后端流转
6. 跑测试、构建和浏览器验证

