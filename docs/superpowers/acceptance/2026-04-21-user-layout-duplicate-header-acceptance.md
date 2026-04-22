# Acceptance Criteria: 用户端个人空间重复 Header 修复

**Spec:** `docs/superpowers/specs/2026-04-21-user-layout-duplicate-header-design.md`
**Date:** 2026-04-21
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | `(user)` 路由布局与 `components/UserLayout` 组合渲染时，页面只出现一套顶部 Header。 | Logic | 前端测试可运行，测试中同时渲染 `app/(user)/UserLayoutClient` 与 `components/UserLayout`。 | 断言页面中 `GraphHire 图谱智聘` 品牌标识只出现 1 次。 |
| AC-002 | `(user)` 路由布局与 `components/UserLayout` 组合渲染时，页面只出现一套 Footer。 | Logic | 前端测试可运行，测试中同时渲染 `app/(user)/UserLayoutClient` 与 `components/UserLayout`。 | 断言页脚文案 `© 2026 GraphHire 图谱智聘` 只出现 1 次。 |
| AC-003 | 修复后个人空间页面仍保留左侧侧边栏与页面主体内容。 | Logic | 前端测试可运行，测试中渲染包含示例内容的 `components/UserLayout`。 | 断言 `智聘空间` 与示例主体内容同时存在。 |
| AC-004 | 浏览器打开 `/resume/manage` 时，顶部只显示一条导航栏，不再出现截图中的双 Header。 | UI interaction | 前端服务已启动，存在可访问的登录态或页面可直接打开。 | 页面顶部品牌导航只出现 1 条，可见左侧侧边栏和正文区域。 |
| AC-005 | 浏览器打开 `/profile` 时，顶部只显示一条导航栏，不再出现双 Footer 或明显布局错位。 | UI interaction | 前端服务已启动，存在可访问的登录态或页面可直接打开。 | 页面顶部和底部都只出现 1 套公共壳，主体区域布局正常。 |
