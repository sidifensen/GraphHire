# Acceptance Criteria: 企业端 Mock 页面内联迁移

**Spec:** `docs/superpowers/specs/2026-04-30-123837-enterprise-mock-pages-inline-design.md`  
**Date:** 2026-04-30  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 企业端 9 个 `page.tsx` 不再导入 `_mock/pages` | Logic | 代码完成迁移 | 对 9 个 `page.tsx` 做文本检查，均不包含 `/_mock/pages/` |
| AC-002 | 企业端 9 个 `page.tsx` 不再依赖 `react-router-dom` | Logic | 代码完成迁移 | 对 9 个 `page.tsx` 做文本检查，均不包含 `react-router-dom` |
| AC-003 | `_mock/pages` 目录被移除 | Logic | 代码完成迁移 | `frontend/src/app/enterprise/_mock/pages` 路径不存在 |
| AC-004 | 企业端关键页面可正常渲染 | UI interaction | 前端开发服务已启动且可访问 | 访问 `/enterprise/dashboard`、`/enterprise/jobs`、`/enterprise/recommendations` 页面能加载且出现关键文案 |
| AC-005 | 前端构建与测试通过 | Logic | 安装依赖完成 | `npm run build` 与 `npm run test:run` 均返回成功退出码 |
| AC-006 | 后端编译与测试通过 | Logic | Java/Maven 环境可用 | `mvn compile` 与 `mvn test` 均返回成功退出码 |
