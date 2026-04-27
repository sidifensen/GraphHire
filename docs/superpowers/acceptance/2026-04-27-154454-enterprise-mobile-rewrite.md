# Acceptance Criteria: 企业端移动端无感切换

**Spec:** `docs/superpowers/specs/2026-04-27-154454-enterprise-mobile-rewrite-design.md`
**Date:** 2026-04-27
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 当请求路径是 `/enterprise/**` 且 UA 为移动设备时，中间件触发内部 rewrite 到 `/_mobile/**` | Logic | 构造移动 UA 和企业端路径输入 | 返回重写目标路径以 `/_mobile` 开头 |
| AC-002 | 当请求路径是 `/enterprise/**` 但 UA 为非移动设备时，不触发 rewrite | Logic | 构造桌面 UA 和企业端路径输入 | rewrite 判定为 false |
| AC-003 | 当请求路径非企业端（如 `/jobs`）时，不触发 rewrite | Logic | 构造移动 UA 和非企业端路径输入 | rewrite 判定为 false |
| AC-004 | `/enterprise/jobs/new` 能正确映射到 `/_mobile/jobs/create` | Logic | 输入路径 `/enterprise/jobs/new` | 映射结果为 `/jobs/create`（内部再拼 `/_mobile`） |
| AC-005 | `/enterprise/employees` 能正确映射到 `/_mobile/team` | Logic | 输入路径 `/enterprise/employees` | 映射结果为 `/team` |
| AC-006 | `/enterprise/notifications` 能正确映射到 `/_mobile/messages` | Logic | 输入路径 `/enterprise/notifications` | 映射结果为 `/messages` |
| AC-007 | 未知企业端子路径回落到 `/_mobile` 首页 | Logic | 输入路径 `/enterprise/unknown` | 映射结果为 `/` |
| AC-008 | 手机访问企业端页面时浏览器地址栏不变化 | UI interaction | 本地启动前端并用移动设备 UA 打开 `/enterprise/dashboard` | 地址栏仍显示 `/enterprise/dashboard`，页面展示移动端布局 |
| AC-009 | 企业端移动页面在 `/_mobile` 目录可正常渲染关键页面（首页、职位、推荐、团队、消息） | UI interaction | 本地前端启动并可访问 `/_mobile/*` | 页面加载成功且无路由 404 |

