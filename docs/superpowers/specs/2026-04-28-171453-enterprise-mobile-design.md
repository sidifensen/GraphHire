# 企业端手机版接入设计

**日期：** 2026-04-28
**状态：** Approved

---

## 背景

当前企业端公开页面位于 `frontend/src/app/enterprise/**`，桌面端已经接通真实企业数据与交互。仓库中另有一套独立原型 `docs/graphhire企业端手机版`，包含完整的企业端手机页面视觉与页面结构。目标是在不改变现有企业端桌面样式和公开地址的前提下，让手机访问企业端页面时无感切换到这套移动版页面。

## 目标

- 手机访问现有企业端公开路径时，地址栏保持 `/enterprise/**` 不变。
- 移动端界面直接复用 `docs/graphhire企业端手机版/src/**` 中的页面、组件、常量和样式，不重新设计页面。
- 桌面端企业页面继续使用当前 `frontend/src/app/enterprise/**` 实现，不引入移动 UI 分支。
- 企业端首批覆盖全部现有公开页面：`dashboard`、`jobs`、`jobs/new`、`jobs/[id]`、`jobs/[id]/edit`、`recommendations`、`employees`、`notifications`。

## 非目标

- 不改动企业端现有桌面页面的视觉和交互。
- 不把原型中的 `BrowserRouter` 直接引入生产前端运行链路。
- 不新增新的公开企业端 URL。
- 不尝试在本次接入中把原型假数据替换成企业端真实数据逻辑。

## 方案概述

### 1. 隐藏内部移动路由

沿用用户端手机版方案，在前端新增 `frontend/src/app/mobile-enterprise/**` 作为企业端隐藏内部移动路由前缀。所有手机访问的企业端公开路由都通过中间件 rewrite 到该前缀下的内部页面，公开 URL 保持不变。

### 2. 企业端路径映射

在 `frontend/src/lib/device-routing.ts` 中扩展企业端路由映射与判断逻辑，维护公开企业路径与内部 `mobile-enterprise` 路由之间的双向映射。映射规则以现有企业端公开路由为准，但内部路径语义尽量贴近原型：

- `/enterprise/dashboard` -> `/mobile-enterprise`
- `/enterprise/jobs` -> `/mobile-enterprise/jobs`
- `/enterprise/jobs/new` -> `/mobile-enterprise/jobs/create`
- `/enterprise/jobs/[id]` -> `/mobile-enterprise/jobs/[id]`
- `/enterprise/jobs/[id]/edit` -> `/mobile-enterprise/jobs/[id]/edit`
- `/enterprise/recommendations` -> `/mobile-enterprise/recommendations`
- `/enterprise/employees` -> `/mobile-enterprise/team`
- `/enterprise/notifications` -> `/mobile-enterprise/messages`

### 3. 中间件重写

`frontend/middleware.ts` 继续基于移动端 UA / client hint 判定是否启用 rewrite。对企业端公开路径新增和用户端同级的企业端重写逻辑：

- 桌面访问 `/enterprise/**`：继续进入当前桌面企业端页面。
- 手机访问 `/enterprise/**`：rewrite 到 `/mobile-enterprise/**` 对应路径。

### 4. 原型迁移方式

将 `docs/graphhire企业端手机版/src/**` 中的以下内容迁入前端：

- `components/**`
- `pages/**`
- `lib/**`
- `constants.ts`
- `index.css` 中仍有用的移动端样式与 token

同时移除原型对 `BrowserRouter` 和 `react-router-dom` 运行时路由的依赖，改为 Next App Router 的目录路由。

### 5. 路由适配层

参考 `frontend/src/app/mobile-user/_lib/router.tsx`，新增企业端移动路由适配层，提供：

- `Link`
- `NavLink`
- `useNavigate`
- `useLocation`
- `useParams`

该适配层负责把内部 `mobile-enterprise` 路径还原到公开 `/enterprise/**` 路径进行跳转和高亮判断，使迁移后的页面尽量少改原型路由代码。

### 6. App Router 页面入口

为企业端移动内部路由新增与原型等价的目录入口：

- `frontend/src/app/mobile-enterprise/page.tsx`
- `frontend/src/app/mobile-enterprise/jobs/page.tsx`
- `frontend/src/app/mobile-enterprise/jobs/create/page.tsx`
- `frontend/src/app/mobile-enterprise/jobs/[id]/page.tsx`
- `frontend/src/app/mobile-enterprise/jobs/[id]/edit/page.tsx`
- `frontend/src/app/mobile-enterprise/recommendations/page.tsx`
- `frontend/src/app/mobile-enterprise/team/page.tsx`
- `frontend/src/app/mobile-enterprise/messages/page.tsx`

另有统一 `layout.tsx` 注入移动壳与样式。

## 页面映射约束

- `team` 只作为内部移动路径存在，对外仍是 `/enterprise/employees`。
- `messages` 只作为内部移动路径存在，对外仍是 `/enterprise/notifications`。
- `jobs/create` 只作为内部移动路径存在，对外仍是 `/enterprise/jobs/new`。
- 原型中的 `candidate/:id` 不应暴露为新的公开企业端路径。若迁移代码中存在这类链接，需要改为当前企业端可承载的行为，或在内部页面中移除不可达入口。

## 测试策略

### 单元测试

- 扩展 `frontend/src/tests/lib/device-routing.test.ts`，覆盖企业端路径识别、内部映射、反向映射和移动重写判断。
- 新增企业端移动壳测试，验证在首页显示底部导航、在内部详情 / 表单页隐藏底部导航。

### 页面结构测试

- 验证 `mobile-enterprise` 的公开路径还原逻辑不会把企业端导航跳到 `/mobile-enterprise/**` 暴露地址。
- 验证中间件映射函数为 `employees`、`notifications`、`jobs/new` 这些语义不完全同名的路由返回正确内部地址。

### 集成验证

- 前端 `npm run build`
- 前端 `npm run test:run`
- 后端 `mvn compile`
- 后端 `mvn test`
- 使用浏览器通过手机视口访问企业端公开地址，确认地址不变且展示移动端页面。

## 风险与处理

- 原型依赖 `motion/react`，当前前端依赖是 `framer-motion`。迁移时需统一为仓库已使用的动画库，或降级为无库动画。
- 原型样式 token 若与前端全局样式冲突，应限制在 `mobile-enterprise` layout 内引入，避免污染桌面端。
- 原型含有假数据与不可达页面入口，必须在迁移时最小化清理，只保留本次可路由到的页面。
