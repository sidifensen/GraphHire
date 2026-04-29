# Acceptance Criteria: 企业端手机版图标样式回归修复

**Spec:** `docs/superpowers/specs/2026-04-29-144903-enterprise-mobile-icon-regression-design.md`
**Date:** 2026-04-29
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 企业端移动样式契约测试要求 Tailwind 主题暴露 `secondary-container` 颜色键 | Logic | 进入 `frontend` 目录并运行 Vitest 定向测试 | 新增样式契约测试通过，断言 `tailwind.config.ts` 中 `secondary-container` 映射存在且值为 `var(--color-secondary-container)` |
| AC-002 | 全局 Material Symbols 规则不再强制 `font-size: 1em`，且默认 `opsz` 对齐移动端原型 | Logic | 进入 `frontend` 目录并运行 Vitest 定向测试 | 新增样式契约测试通过，断言 `globals.css` 的 `.material-symbols-outlined` 规则不包含 `font-size: 1em`，并包含 `opsz 24` |
| AC-003 | 企业端手机版首页快捷操作和统计卡图标背景样式恢复可渲染 | UI interaction | 前端服务运行，企业端已登录，可通过移动端路径或移动端改写访问企业端首页 | 浏览器中首页快捷操作图标圆形背景不透明，统计卡右侧图标容器可见背景色 |
| AC-004 | 企业端手机版导航图标尺寸恢复，不再退回全局 14px | UI interaction | 前端服务运行，企业端已登录，可访问企业端手机版首页 | 浏览器计算样式中底部导航或顶部返回主图标字号为原型对应值（如 24px），而非 14px |
| AC-005 | 项目级验证命令全部通过后才可结束任务 | Logic | 前端与后端依赖可用 | `frontend` 下 `npm run build`、`npm run test:run`，`backend` 下 `mvn compile`、`mvn test` 均成功退出 |
