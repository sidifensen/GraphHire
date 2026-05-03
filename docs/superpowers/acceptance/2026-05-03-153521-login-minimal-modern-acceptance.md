# Acceptance Criteria: Login Minimal Modern Refresh

**Spec:** `docs/superpowers/specs/2026-05-03-153521-login-minimal-modern-design.md`  
**Date:** 2026-05-03  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 登录页渲染新的页面外层布局容器与品牌信息容器 | UI interaction | 启动前端并访问 `/login` | 页面中可见品牌标题 `GraphHire`，并存在布局壳层与品牌区容器（由测试标识验证） |
| AC-002 | 登录表单核心字段保持可用且类型不变 | Logic | 渲染 `LoginPage` 组件 | 邮箱输入框仍为 `type=email`，密码输入框仍为 `type=password`，两者存在 |
| AC-003 | 角色切换后测试账号自动填充行为不变 | Logic | 渲染 `LoginPage`，点击 `招聘者` 标签 | 邮箱自动变为 `hr@techchina.com`，密码为 `password123` |
| AC-004 | 从招聘者切回求职者后填充值恢复 | Logic | 渲染 `LoginPage`，先点 `招聘者` 再点 `求职者` | 邮箱恢复 `13800138001@phone.com`，密码恢复 `password123` |
| AC-005 | 前端构建和测试在改造后仍通过 | Logic | 在 `frontend` 目录执行构建与测试命令 | `npm run build` 退出码为 0，`npm run test:run` 退出码为 0 |
