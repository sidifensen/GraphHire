# 前端本地 Material Symbols 设计

**日期：** 2026-04-28  
**状态：** Approved

---

## 背景

当前前端通过 Google Fonts 在线加载 `Material Symbols Outlined`，入口位于 `frontend/src/app/layout.tsx` 与 `frontend/src/styles/globals.css`。在国内网络环境下，图标资源请求容易变慢或失败，直接导致页面首屏出现空白图标或渲染延迟。

用户要求保持现有 `material-symbols-outlined` 写法，不引入自动扫描脚本，仅将当前前端已经使用到的 Google 图标下载到仓库内，并把后续使用约束写进前端规范。

## 目标

1. 运行时不再向 Google 请求 Material Symbols 图标资源。
2. 保持现有页面中 `material-symbols-outlined` 的使用方式不变。
3. 仅下载当前前端实际使用到的图标子集，而不是引入完整整包字体。
4. 在前端规范中明确后续不得重新接入 Google 图标外链。

## 非目标

1. 不迁移现有图标到 `lucide-react`。
2. 不实现自动扫描源码并重建图标字体的脚本。
3. 不处理本次任务之外的 Google 文本字体来源。

## 方案

### 1. 本地图标子集

从 Google 官方 Material Symbols CSS2 接口按当前项目所需图标名称生成子集字体，下载生成后的 `woff2` 文件并存放到 `frontend/public/fonts/`。同时在仓库内保存当前使用到的图标清单，作为后续人工更新依据。

### 2. 全局样式切换

删除运行时的 Material Symbols Google 外链：

- `frontend/src/app/layout.tsx` 中的 `<link href="https://fonts.googleapis.com/...Material+Symbols...">`
- `frontend/src/styles/globals.css` 中的 Material Symbols `@import`

改为在 `frontend/src/styles/globals.css` 中声明本地 `@font-face`，字体文件指向 `/fonts/material-symbols-outlined-subset.woff2`，并保留现有 `.material-symbols-outlined` 与 `.icon-fill` 类名约定。

### 3. 前端规范更新

在 `frontend/AGENTS.md` 追加一条简短规则：

- 禁止重新引入 Google Material Symbols 外链
- 若继续使用 `material-symbols-outlined`，必须复用仓库中的本地图标子集资源
- 新增图标时同步更新本地图标清单与字体文件

## 文件变更

- 修改：`frontend/src/app/layout.tsx`
- 修改：`frontend/src/styles/globals.css`
- 修改：`frontend/AGENTS.md`
- 新增：`frontend/public/fonts/material-symbols-outlined-subset.woff2`
- 新增：`frontend/public/fonts/material-symbols-outlined-icons.txt`
- 新增：`frontend/tests/lib/material-symbols-local.test.ts`

## 风险与处理

### 图标遗漏

部分页面存在动态图标名，若清单漏掉会在运行时显示为空白方块。处理方式是先人工核对所有动态来源，将动态图标补入清单后再下载子集字体。

### 视觉差异

同一字体子集仍来自官方 Material Symbols，因此现有视觉风格不变。不会像切换到 SVG 图标组件那样引入整体风格漂移。

## 测试策略

1. 逻辑测试验证 `layout.tsx` 与 `globals.css` 中不再包含 Material Symbols 的 Google 外链。
2. 逻辑测试验证本地字体文件与图标清单文件存在。
3. 前端构建与测试命令通过。
4. 浏览器打开前端首页或含 Material Symbols 的页面，确认图标在断开 Google 依赖后仍可正常显示。
