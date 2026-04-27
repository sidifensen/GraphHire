# 企业端移动端无感切换设计

**日期**: 2026-04-27
**范围**: 仅企业端 URL（`/enterprise/**`）

## 背景
当前前端为 Next.js，已存在移动端路由体系，但你提供了一套新的企业端完整手机页面（`docs/graphhire-企业端-手机端页面`）。
目标是在不改变浏览器地址栏的前提下，对手机设备访问企业端 URL 做无感切换。

## 目标
1. 手机设备访问 `/enterprise/**` 时，服务端中间件内部 rewrite 到 `/_mobile/**`。
2. 浏览器地址栏保持原始 `/enterprise/**`，不做 redirect。
3. PC 设备保持现有企业端桌面页面。
4. 接入你提供的企业端手机页面能力与路由。

## 非目标
1. 不改造用户端（非企业端）路由切换逻辑。
2. 不新增手动切换参数（如 `?view=desktop`）。

## 方案
### 1) 路由前缀与映射
- 内部移动前缀使用 `/_mobile`。
- 中间件只处理 `/enterprise` 前缀。
- 重写规则：
  - `/enterprise` -> `/_mobile`
  - `/enterprise/jobs` -> `/_mobile/jobs`
  - `/enterprise/jobs/new` -> `/_mobile/jobs/create`
  - `/enterprise/jobs/:id` -> `/_mobile/jobs/:id`
  - `/enterprise/jobs/:id/edit` -> `/_mobile/jobs/:id/edit`
  - `/enterprise/recommendations` -> `/_mobile/recommendations`
  - `/enterprise/employees` -> `/_mobile/team`
  - `/enterprise/notifications` -> `/_mobile/messages`
  - 其他 `/enterprise/**` 未命中路径回落 `/_mobile`

### 2) 页面接入
- 在 `frontend/src/mobile-enterprise` 放置企业端移动页面组件（从 docs 的手机页面迁入）。
- 在 `frontend/src/app/_mobile/**` 建立 Next App Router 页面壳，渲染对应 `mobile-enterprise/pages/*` 组件。
- `/_mobile/layout.tsx` 使用企业端移动 Shell（底部导航等）。

### 3) 设备识别
- 复用 UA 判定能力，仅对企业端路径生效。
- API、静态资源、`/_mobile` 本身等路径跳过 rewrite，防止循环。

## 异常与边界
1. UA 缺失或非移动端：不 rewrite。
2. 非企业端路径：不 rewrite。
3. 企业端未知子路径：rewrite 到 `/_mobile` 首页，避免 404。

## 测试策略
1. 单元测试（逻辑）：
- 仅企业端+移动 UA 才触发 rewrite。
- 路由映射是否符合规则。
- 未知企业端路径是否回落首页。

2. 集成验证（本地命令）：
- 前端构建与测试。
- 后端编译与测试（按仓库硬约束）。

3. 浏览器验证（CDP）：
- 手机 UA 打开企业端 URL，确认地址栏仍为 `/enterprise/**`。
- 页面内容来自移动端实现（导航/布局特征正确）。
