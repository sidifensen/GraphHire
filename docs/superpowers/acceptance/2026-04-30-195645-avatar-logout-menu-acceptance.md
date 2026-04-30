# Acceptance Criteria: 头像下拉退出登录

**Spec:** `docs/superpowers/specs/2026-04-30-195645-avatar-logout-menu-design.md`
**Date:** 2026-04-30
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 企业端桌面端点击右上角头像区域后展示下拉菜单中的“退出登录”按钮 | UI interaction | 企业端用户已登录，桌面视口 | 点击头像后，页面出现可点击“退出登录”菜单项 |
| AC-002 | 企业端移动端点击顶部头像后展示下拉菜单中的“退出登录”按钮 | UI interaction | 企业端用户已登录，移动端视口 | 点击头像后，页面出现可点击“退出登录”菜单项 |
| AC-003 | 企业端点击“退出登录”后执行统一登出逻辑 | Logic | 渲染企业端顶部导航并 mock `logoutWithServerInvalidation` | 点击“退出登录”触发 `logoutWithServerInvalidation(..., '/login', 'enterprise')` |
| AC-004 | 用户端桌面端点击头像区域后展示下拉菜单中的“退出登录”按钮 | UI interaction | 用户端用户已登录，桌面视口 | 点击头像后，页面出现可点击“退出登录”菜单项 |
| AC-005 | 用户端点击“退出登录”后执行统一登出逻辑 | Logic | 渲染用户端导航并 mock `logoutWithServerInvalidation` | 点击“退出登录”触发 `logoutWithServerInvalidation(..., '/login', 'user')` |
| AC-006 | 用户端移动端退出入口可用并成功退出 | UI interaction | 用户端用户已登录，移动端视口 | 点击移动端可见退出入口后，页面跳转登录页且登录态被清理 |