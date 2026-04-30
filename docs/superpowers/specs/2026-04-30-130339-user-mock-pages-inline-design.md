# 用户端 Mock 页面内联迁移设计

**日期**: 2026-04-30  
**范围**: `frontend/src/app/(user)/*/page.tsx`、`frontend/src/app/page.tsx`、`frontend/src/app/(user)/_mock/pages/*`

---

## 目标

将用户端当前通过 `@/app/(user)/_mock/pages/*` 转发的路由页面全部迁移为“对应 `page.tsx` 直接承载页面实现”，不再引用 `_mock/pages`。

## 迁移范围

- 首页与用户端路由：
  - `src/app/page.tsx`
  - `src/app/(user)/applications/page.tsx`
  - `src/app/(user)/companies/page.tsx`
  - `src/app/(user)/companies/[id]/page.tsx`
  - `src/app/(user)/jobs/page.tsx`
  - `src/app/(user)/jobs/[id]/page.tsx`
  - `src/app/(user)/notifications/page.tsx`
  - `src/app/(user)/personal-info/page.tsx`
  - `src/app/(user)/profile/page.tsx`
  - `src/app/(user)/resume/manage/page.tsx`
  - `src/app/(user)/resume/upload/page.tsx`
  - `src/app/(user)/skill-graph/page.tsx`
- 删除：`src/app/(user)/_mock/pages/*`

## 方案

1. 将 `_mock/pages` 中对应页面代码直接复制到各路由 `page.tsx`。  
2. 页面内直接依赖 `react-router-dom` 的部分替换为 Next API（`next/link`、`next/navigation`）。  
3. `_mock/pages` 删除后，页面仍可依赖 `_mock/components`、`_mock/mockData`、`_mock/hooks` 等共享模块。  
4. 用静态回归测试约束：
   - 12 个用户端路由页不再引用 `_mock/pages`；
   - 12 个路由页不再直接引用 `react-router-dom`；
   - `_mock/pages` 目录已删除。

## 风险与控制

- 风险：批量迁移文件多，容易遗漏个别路由页。
- 控制：通过单测对目标文件列表做逐一检查，构建 + 全量测试 + CDP 页面验证兜底。
