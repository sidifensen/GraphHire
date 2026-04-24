# Acceptance Criteria: 管理端页面直接替换

**Spec:** `docs/superpowers/specs/2026-04-24-110751-admin-console-direct-replace-design.md`
**Date:** 2026-04-24
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 管理端登录页展示替换后的品牌与欢迎文案 | UI interaction | 启动前端开发服务并访问 `/admin/login` | 页面展示 `GraphHire`、`欢迎回来`、`请登录以继续管理 GraphHire 平台` 文案 |
| AC-002 | 管理端登录页保留账号密码提交能力 | Logic | mock `adminApi.login` 返回 token，提交用户名密码 | 调用 `adminApi.login` 一次并跳转到 `/admin/dashboard` |
| AC-003 | 管理端登录失败时展示错误提示 | Logic | mock `adminApi.login` 抛错，提交用户名密码 | 页面出现错误提示文本且按钮恢复可点击 |
| AC-004 | 管理端侧边栏展示统一品牌区与导航项 | UI interaction | 登录后访问 `/admin/dashboard` | 侧边栏显示 `GraphHire`、`图谱智聘管理端` 与既有管理菜单项 |
| AC-005 | 侧边栏导航激活态与路由映射保持正确 | UI interaction | 分别访问 `/admin/dashboard`、`/admin/users` | 对应菜单项显示激活样式，跳转路径与原有保持一致 |
| AC-006 | 管理端 Header 展示用户信息并可打开菜单 | Logic | mock 已登录用户状态，渲染任意管理页 Header | 页面可见用户信息区域，点击头像后出现下拉菜单 |
| AC-007 | Header 退出登录动作保持可用 | Logic | mock `logoutWithServerInvalidation`，点击退出按钮 | 调用登出逻辑一次并传入 `/admin/login` 目标路径 |
| AC-008 | `settings` 页面接入统一管理端布局 | UI interaction | 访问 `/admin/settings` | 页面与其他管理页共享同一 Sidebar 与 Header 外观 |
| AC-009 | 页面替换不破坏管理端编译与测试 | Logic | 执行 `npm run build` 与 `npm run test:run` | 两个命令均以退出码 0 成功结束 |
| AC-010 | 浏览器端实机可访问登录页与仪表盘页 | UI interaction | 使用 web-access 的 CDP 打开页面 | `/admin/login`、`/admin/dashboard` 页面可正常渲染且无阻断错误 |
