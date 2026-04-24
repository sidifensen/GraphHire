# Bootstrap Report: 管理端静态模板迁移基线

## 日期
2026-04-24

## 范围
- `frontend/src/app/admin/**`
- `frontend/src/components/admin/**`
- `frontend/src/context/ThemeContext.tsx`
- `frontend/src/styles/globals.css`

## 已建立记忆资产
- 模块卡：`docs/superpowers/memory/modules/admin-console-static-template.md`
- 契约：`docs/superpowers/memory/contracts/admin-console-route-and-static-data-contract.md`
- 索引更新：`docs/superpowers/memory/index.md`

## 证据来源
- 模板目录：`docs/graphhire-图谱智聘 (5)/src/**`
- 现有管理端目录：`frontend/src/app/admin/**`、`frontend/src/components/admin/**`
- 运行依赖：`frontend/package.json`

## 关键发现
- 模板与现工程均基于 Next.js App Router，可直接做路由级迁移。
- 模板动画依赖 `motion/react`，现工程依赖为 `framer-motion`，需适配。
- 管理端现有页面已具备与模板近似的功能路由，可按路径平移。

## 未决与后续
- 后续若从静态数据切换到后端接口，应新增 `admin data adapter` 层并补齐契约测试。
