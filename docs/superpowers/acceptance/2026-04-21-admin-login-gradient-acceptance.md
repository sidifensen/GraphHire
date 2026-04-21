# Acceptance Criteria: 管理端登录页渐变修复

**Spec:** `docs/superpowers/specs/2026-04-21-admin-login-gradient-design.md`  
**Date:** 2026-04-21  
**Status:** Draft

---

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 页面保留品牌标题与“管理后台”主标题 | Logic | 可渲染管理端登录页组件 | 页面可查询到 `GraphHire 图谱智聘` 与 `管理后台` 文本 |
| AC-002 | 页面背景包含左上角深蓝径向渐变 | Logic | 可渲染管理端登录页组件 | 背景装饰节点的 `style.backgroundImage` 包含 `circle at 0% 0%` 且包含深蓝色值 |
| AC-003 | 页面背景保留右下角浅蓝渐变呼应 | Logic | 可渲染管理端登录页组件 | 背景装饰节点的 `style.backgroundImage` 包含 `circle at 100% 100%` |
| AC-004 | 登录卡片内部存在右上角环境光晕装饰 | Logic | 可渲染管理端登录页组件 | 页面存在 `data-testid=admin-login-card-glow` 的装饰节点 |
| AC-005 | 修复后前端测试和构建通过 | Build | 依赖已安装 | `npm run test:run -- admin-login.test.tsx` 与 `npm run build` 均成功 |
