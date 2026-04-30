# Acceptance Criteria: 用户端 Mock 页面内联迁移

**Spec:** `docs/superpowers/specs/2026-04-30-130339-user-mock-pages-inline-design.md`  
**Date:** 2026-04-30  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 12 个用户端目标路由页不再导入 `(user)/_mock/pages` | Logic | 迁移完成 | 对 12 个 `page.tsx` 做文本检查，均不包含 `/(user)/_mock/pages/` |
| AC-002 | 12 个用户端目标路由页不再直接依赖 `react-router-dom` | Logic | 迁移完成 | 对 12 个 `page.tsx` 做文本检查，均不包含 `react-router-dom` |
| AC-003 | 用户端 `_mock/pages` 目录被删除 | Logic | 迁移完成 | `frontend/src/app/(user)/_mock/pages` 路径不存在 |
| AC-004 | 用户端关键页面可访问 | UI interaction | 前端服务可访问 | `/`、`/jobs`、`/companies` 页面可加载并出现关键文案 |
| AC-005 | 前端构建与测试通过 | Logic | 依赖已安装 | `npm run build` 与 `npm run test:run` 成功 |
| AC-006 | 后端编译与测试通过 | Logic | Java/Maven 可用 | `mvn compile` 与 `mvn test` 成功 |
