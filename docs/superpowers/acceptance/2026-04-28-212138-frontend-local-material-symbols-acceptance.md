# Acceptance Criteria: 前端本地 Material Symbols

**Spec:** `docs/superpowers/specs/2026-04-28-212138-frontend-local-material-symbols-design.md`  
**Date:** 2026-04-28  
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 根布局不再通过 Google Fonts 链接加载 Material Symbols | Logic | 仓库代码已更新 | `frontend/src/app/layout.tsx` 中不存在 `Material+Symbols` 或 `fonts.googleapis.com` 的图标链接 |
| AC-002 | 全局样式不再通过 Google `@import` 加载 Material Symbols | Logic | 仓库代码已更新 | `frontend/src/styles/globals.css` 中不存在 Material Symbols 的 Google `@import` |
| AC-003 | 全局样式改为声明本地 Material Symbols 字体资源 | Logic | 仓库代码已更新 | `frontend/src/styles/globals.css` 中存在指向 `/fonts/material-symbols-outlined-subset.woff2` 的 `@font-face` |
| AC-004 | 仓库包含当前前端使用到的 Material Symbols 本地字体文件 | Logic | 仓库代码已更新 | `frontend/public/fonts/material-symbols-outlined-subset.woff2` 文件存在且非空 |
| AC-005 | 仓库保留当前使用到的 Material Symbols 图标清单 | Logic | 仓库代码已更新 | `frontend/public/fonts/material-symbols-outlined-icons.txt` 文件存在且包含当前动态图标补充项 |
| AC-006 | 前端规范明确禁止重新接入 Google Material Symbols 外链 | Logic | 仓库代码已更新 | `frontend/AGENTS.md` 中存在本地 Material Symbols 使用约束 |
| AC-007 | 前端单测覆盖本地图标资源切换约束 | Logic | 依赖已安装 | `npm run test:run -- material-symbols-local.test.ts` 通过 |
| AC-008 | 前端构建不因图标资源本地化而失败 | Logic | 依赖已安装 | `npm run build` 成功退出 |
| AC-009 | 浏览器访问前端页面时 Material Symbols 图标可正常显示 | UI interaction | 前端开发服务可访问 | 使用浏览器打开含 Material Symbols 的页面后，可见图标正常渲染且不依赖 Google 图标外链 |
