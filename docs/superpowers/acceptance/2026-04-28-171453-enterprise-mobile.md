# Acceptance Criteria: 企业端手机版接入

**Spec:** `docs/superpowers/specs/2026-04-28-171453-enterprise-mobile-design.md`
**Date:** 2026-04-28
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 公开企业端路径 `/enterprise/dashboard` 在移动重写映射中被识别为企业端移动路由 | Logic | 运行 `device-routing` 单元测试 | `mapEnterprisePathToMobileInternalPath('/enterprise/dashboard')` 返回 `/mobile-enterprise` |
| AC-002 | 公开企业端路径 `/enterprise/jobs/new` 在移动重写映射中被映射到原型内部创建页 | Logic | 运行 `device-routing` 单元测试 | `mapEnterprisePathToMobileInternalPath('/enterprise/jobs/new')` 返回 `/mobile-enterprise/jobs/create` |
| AC-003 | 公开企业端路径 `/enterprise/employees` 和 `/enterprise/notifications` 会映射到原型同语义内部路径 | Logic | 运行 `device-routing` 单元测试 | `/enterprise/employees` 返回 `/mobile-enterprise/team`，`/enterprise/notifications` 返回 `/mobile-enterprise/messages` |
| AC-004 | 企业端内部移动路径能够反向还原为公开企业端地址 | Logic | 运行 `device-routing` 单元测试 | `/mobile-enterprise/team` 还原为 `/enterprise/employees`，`/mobile-enterprise/messages` 还原为 `/enterprise/notifications` |
| AC-005 | 手机设备访问企业端公开路径时会触发移动重写 | Logic | 运行 `device-routing` 单元测试并提供移动端 UA | `shouldRewriteToMobile('/enterprise/jobs', mobileUA)` 返回 `true` |
| AC-006 | 桌面设备访问企业端公开路径时不会触发移动重写 | Logic | 运行 `device-routing` 单元测试并提供桌面 UA | `shouldRewriteToMobile('/enterprise/jobs', desktopUA)` 返回 `false` |
| AC-007 | 企业端移动壳在首页显示底部导航 | UI interaction | 渲染 `mobile-enterprise` 壳组件，当前路径为 `/mobile-enterprise` | 页面中可见 `工作台`、`职位`、`推荐`、`团队` 四个底部导航入口 |
| AC-008 | 企业端移动壳在创建页或详情页隐藏底部导航 | UI interaction | 渲染 `mobile-enterprise` 壳组件，当前路径为 `/mobile-enterprise/jobs/create` 或 `/mobile-enterprise/jobs/1` | 页面中不可见底部导航入口 |
| AC-009 | 企业端移动页的链接跳转保持公开 `/enterprise/**` 地址 | UI interaction | 渲染企业端移动导航适配组件 | `Link` 和 `NavLink` 生成的 `href` 以 `/enterprise` 开头，而不是 `/mobile-enterprise` |
| AC-010 | `mobile-enterprise` 目录包含与原型等价的全量页面入口 | Logic | 检查 `frontend/src/app/mobile-enterprise/**` 目录 | 存在首页、职位列表、职位创建、职位详情、职位编辑、推荐、团队、消息页入口文件 |
| AC-011 | 前端构建通过且企业端移动页能参与打包 | Logic | 在 `frontend` 目录运行 `npm run build` | 命令退出码为 0 |
| AC-012 | 前端测试通过且包含企业端移动路由相关新增测试 | Logic | 在 `frontend` 目录运行 `npm run test:run` | 命令退出码为 0，新增企业端移动测试为通过状态 |
| AC-013 | 手机视口访问企业端公开地址时地址栏不变且展示移动端布局 | UI interaction | 启动前端并用浏览器手机视口访问 `/enterprise/dashboard` | 地址栏保持 `/enterprise/dashboard`，页面展示企业端移动壳而不是桌面头部 |
