# 模块卡：管理端静态模板迁移

## 责任边界
- 管理端路由仅覆盖 `/admin` 及其子路由，不修改用户端与企业端业务页面。
- 管理端页面在本次重构阶段使用静态演示数据，不接入后端 API。
- 管理端主题、布局、侧边栏、表格、统计卡等 UI 组件由 `frontend/src/components/admin/**` 统一承载。

## 关键文件
- 管理端路由：`frontend/src/app/admin/layout.tsx`、`frontend/src/app/admin/login/page.tsx`、`frontend/src/app/admin/dashboard/page.tsx`
- 管理端子页面：`frontend/src/app/admin/enterprise-review/page.tsx`、`frontend/src/app/admin/users/page.tsx`、`frontend/src/app/admin/skill-tags/page.tsx`、`frontend/src/app/admin/task-monitor/page.tsx`
- 管理端组件：`frontend/src/components/admin/AdminShell.tsx`、`frontend/src/components/admin/AdminSidebar.tsx`、`frontend/src/components/admin/AdminTopbar.tsx`、`frontend/src/components/admin/AdminDataTable.tsx`、`frontend/src/components/admin/AdminStatCard.tsx`
- 主题与样式：`frontend/src/context/ThemeContext.tsx`、`frontend/src/styles/globals.css`

## 当前稳定约束
- 管理端路径语义固定为 `/admin/*`，模板中的 `/dashboard/*` 语义通过路由映射适配。
- 迁移后管理端必须可在 `npm run build` 与 `npm run test:run` 下通过验证。
- 动画库使用项目现有依赖 `framer-motion`，不额外引入 `motion/react`。

## 风险点
- 模板视觉样式依赖全局 Token 与类名，若全局样式冲突可能导致 UI 偏差。
- 静态数据与现有真实数据契约存在字段差异，后续接 API 需单独做映射层。
