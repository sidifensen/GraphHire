# Acceptance Criteria: 登录态头像名称与个人主页信息同步

**Spec:** `docs/superpowers/specs/2026-04-30-153125-auth-avatar-profile-sync-design.md`  
**Date:** 2026-04-30  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 求职者已登录时，用户端顶部右侧显示当前用户名称 | UI interaction | 本地 `userAuthStore` 有 `isAuthenticated=true` 且含用户名 | 顶部显示 `displayName`（若有）或 `username`，不再显示“登录 / 注册”按钮 |
| AC-002 | 求职者已登录时，用户端顶部右侧显示头像并支持头像加载失败回退 | UI interaction | 本地 `userAuthStore` 有 `isAuthenticated=true`，头像 URL 可用或不可用两种场景 | 可用 URL 时渲染 `<img>`；加载失败或缺失 URL 时渲染默认用户图标 |
| AC-003 | 招聘者已登录时，企业端顶部右侧显示当前企业用户名称 | UI interaction | 本地 `enterpriseAuthStore` 有 `isAuthenticated=true`；`/company/info` 可返回企业名称 | 顶部右侧显示企业名（`displayName`）或账号名（回退） |
| AC-004 | 招聘者已登录时，企业端顶部右侧显示头像并支持回退 | UI interaction | 本地 `enterpriseAuthStore` 有 `isAuthenticated=true`，并存在/不存在头像两种场景 | 有头像时显示 `<img>`；无头像或加载失败时显示默认图标 |
| AC-005 | 求职者个人主页展示对应登录用户信息，不再固定静态姓名 | UI interaction | 已登录求职者；`/person/info` 返回 `realName/email/avatarUrl` 或为空 | 页面主信息区显示当前用户真实姓名（回退用户名）、邮箱/账号与头像（回退默认图标） |
| AC-006 | 登录态刷新后仍可展示身份信息 | Logic | store 持久化开启，页面刷新一次 | 刷新后 `isAuthenticated` 仍为 true，页面可立即显示持久化名称并在资料请求后可更新为最新值 |
| AC-007 | 资料接口失败时不阻断页面使用 | Logic | 模拟 `personApi.getProfile` 或 `companyApi.getInfo` 抛错 | 页面继续渲染，显示 store 内已有名称与默认头像，不抛出未捕获错误 |
| AC-008 | 前端新增逻辑不破坏现有登录/注册基础行为 | Logic | 运行前端现有登录/注册测试 | `src/tests/pages/login.test.tsx` 与 `src/tests/pages/register.test.tsx` 保持通过 |
