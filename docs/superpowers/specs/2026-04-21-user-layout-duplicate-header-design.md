# 用户端个人空间重复 Header 修复设计规格

**日期：** 2026-04-21  
**状态：** 已批准  
**范围：** 仅用户端路由组 `frontend/src/app/(user)` 及其页面级布局组合

---

## 1. 背景与目标

当前个人空间相关页面（至少包括 `/profile` 与 `/resume/manage`）顶部导航被渲染两次，导致页面出现两个完全相同的 Header。根因不是样式重复，而是用户端路由布局与页面级壳组件同时渲染了 `Header` 与 `Footer`。

本次目标是：统一用户端页面外壳职责，保证个人空间页面在保留侧边栏与主体内容结构的前提下，只渲染一套顶部 Header 和底部 Footer。

---

## 2. 根因分析

当前结构存在两层布局：

1. `frontend/src/app/(user)/UserLayoutClient.tsx`
   - 渲染 `Header`
   - 渲染 `Footer`
2. `frontend/src/components/UserLayout.tsx`
   - 再次渲染 `Header`
   - 再次渲染 `Footer`
   - 渲染 `Sidebar`

而 `profile/page.tsx`、`resume/manage/page.tsx` 等页面又包裹了 `UserLayout`，因此实际渲染链路变为：

`(user)/layout -> Header/Footer` + `page -> UserLayout -> Header/Footer/Sidebar`

最终造成 Header/Footer 重复。

---

## 3. 设计原则

### 3.1 单一外壳原则

用户端公共外壳只能有一个明确负责者，不允许路由布局和页面壳组件重复承担相同职责。

### 3.2 最小改动原则

优先保留当前页面已经依赖的 `UserLayout` 结构，避免同时改动多个页面内容区布局。

### 3.3 回归可测试原则

必须补一条自动化测试，直接验证用户端布局组合下只出现一套 Header/Footer，并且侧边栏仍然存在，避免后续再次把公共壳渲染回两层。

---

## 4. 方案选择

### 方案 A（推荐）

保留 `components/UserLayout.tsx` 作为个人空间页面壳，移除 `app/(user)/UserLayoutClient.tsx` 中的 `Header` 与 `Footer`，让路由组布局只负责提供基础容器。

**优点：**
- 改动最小
- 不需要重写 `profile`、`resume/manage` 等页面
- 侧边栏仍由 `UserLayout` 统一管理

**缺点：**
- 依赖 `UserLayout` 的页面之外，如果存在其他 `(user)` 页面未包裹 `UserLayout`，将不再自动拥有 Header/Footer，需要确认本次影响范围

### 方案 B

保留 `UserLayoutClient` 中的 Header/Footer，删除 `components/UserLayout.tsx` 中的 Header/Footer，只保留 Sidebar + main。

**优点：**
- 更接近 Next.js 路由布局统一托管思路

**缺点：**
- 需要同步调整 `UserLayout` 的容器结构与若干页面间距，风险更高

本次选择 **方案 A**。

---

## 5. 实施设计

### 5.1 代码改动

- 修改 `frontend/src/app/(user)/UserLayoutClient.tsx`
  - 移除 `Header`、`Footer` 引入与渲染
  - 保留基础容器与 `children`
- 保持 `frontend/src/components/UserLayout.tsx` 不变，继续负责：
  - `Header`
  - `Sidebar`
  - `main`
  - `Footer`

### 5.2 测试设计

新增或更新用户端布局测试，覆盖：
- 在 `(user)` 路由布局包裹 `UserLayout` 时，页面只出现 1 个 Header 标识
- 只出现 1 个 Footer 标识
- `Sidebar` 仍然渲染
- 页面内容仍然可见

### 5.3 浏览器验收

修复完成后，使用 `/web-access` 打开个人空间页面，确认：
- 顶部只有一条导航
- 左侧侧边栏正常
- 页面主体未错位

---

## 6. 完成标准

本次任务完成时，必须同时满足：

1. `/profile`、`/resume/manage` 等个人空间页面顶部只显示 1 个 Header
2. 页面底部只存在 1 个 Footer
3. 侧边栏仍正常显示
4. 自动化测试能覆盖该布局回归问题
5. 已通过 `/web-access` 进行页面浏览器验证
