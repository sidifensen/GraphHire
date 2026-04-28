---
type: module_card
title: enterprise-console-shell
summary: 记录企业端控制台壳的入口、布局职责与公开导航约束。
tags:
  - frontend
  - enterprise
owned_paths:
  - frontend/src/app/enterprise
  - frontend/src/components/enterprise
related_docs:
  - docs/superpowers/memory/contracts/enterprise-console-route-contract.md
entrypoints:
  - frontend/src/app/enterprise/layout.tsx
  - frontend/src/components/enterprise/EnterpriseHeader.tsx
  - frontend/src/components/enterprise/EnterpriseAuthGuard.tsx
last_verified_commit: c6cbb51
status: active
---

# 模块卡：企业端控制台壳

## Responsibilities
- `frontend/src/app/enterprise/layout.tsx` 负责组装企业端认证守卫、顶部导航和页面切换容器。
- `frontend/src/components/enterprise/EnterpriseAuthGuard.tsx` 负责校验当前登录上下文必须是企业账号，否则跳转到 `/login`。
- `frontend/src/components/enterprise/EnterpriseHeader.tsx` 负责公开导航入口、当前导航高亮和账号下拉菜单。
- 各企业端页面通过 `frontend/src/components/enterprise/EnterpriseContent.tsx` 获取统一的内容宽度、内边距和底部留白。

## Entry Points
- `frontend/src/app/enterprise/layout.tsx`
- `frontend/src/app/enterprise/dashboard/page.tsx`
- `frontend/src/app/enterprise/jobs/page.tsx`
- `frontend/src/app/enterprise/recommendations/page.tsx`
- `frontend/src/app/enterprise/employees/page.tsx`

## Invariants
- 企业端公开路由统一挂在 `/enterprise/**` 下，由同一个 layout 提供顶部壳。
- 顶部导航当前只暴露 `dashboard`、`jobs`、`recommendations`、`employees` 四个主入口，通知中心不在顶部导航里。
- 认证守卫依赖 `enterpriseAuthStore` 与 `authApi.getContext()` 双重校验企业身份。
- 内容区默认是桌面控制台布局，主内容最大宽度为 `1440px`，并带有 `p-8` 的统一桌面留白。

## Extension Points
- 新增企业端公开页面时，应优先放入 `frontend/src/app/enterprise/**` 并复用 `EnterpriseContent` / `EnterprisePageHeader`。
- 如果新增主导航入口，需要同步更新 `EnterpriseHeader.tsx` 的高亮判断与链接集合。
- 如需接入移动端内部实现，应避免直接改动桌面布局壳，优先新增独立内部路由壳。

## Common Pitfalls
- 只新增页面文件、不更新顶部导航激活规则，会导致导航高亮与路径不一致。
- 在页面内部直接复制布局容器，而不是复用 `EnterpriseContent`，会破坏企业端页面的统一节奏。
- 将企业端移动化直接塞入当前桌面 layout，会放大桌面与移动端耦合并增加回归风险。
