# Acceptance Criteria: 管理端登录页开发模式自动填充

**Spec:** `docs/superpowers/specs/2026-04-27-003440-admin-login-dev-autofill-design.md`  
**Date:** 2026-04-27  
**Status:** Draft

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 管理端登录页在开发环境首次渲染时自动填充测试账号 | Logic | `NODE_ENV=development`，访问 `/admin/login` | 账号输入框默认值为 `admin` |
| AC-002 | 管理端登录页在开发环境首次渲染时自动填充测试密码 | Logic | `NODE_ENV=development`，访问 `/admin/login` | 密码输入框默认值为 `123456` |
| AC-003 | 非开发环境不自动填充管理端登录凭据 | Logic | `NODE_ENV` 非 `development` | 账号和密码输入框默认值为空 |
| AC-004 | 自动填充不影响原有登录成功流程 | UI interaction | 使用默认填充值点击登录，后端返回成功 | 页面完成登录并跳转到 `/admin/dashboard` |

