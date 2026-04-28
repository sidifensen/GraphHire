---
type: contract
title: mobile-user-internal-routing-contract
summary: 约束公开用户路由、移动端内部路由和移动端壳导航之间的路径契约。
tags:
  - frontend
  - mobile-user
  - routing
owned_paths:
  - frontend/src/lib/device-routing.ts
  - frontend/src/app/mobile-user
related_docs:
  - docs/superpowers/memory/modules/mobile-user-app-shell.md
entrypoints:
  - frontend/src/lib/device-routing.ts
  - frontend/src/app/mobile-user/layout.tsx
last_verified_commit: 79d3358
status: active
---

# 契约：移动端内部路由映射

## Scope
- 公开用户路由与 `/mobile-user/**` 内部实现路由之间的双向映射。
- 移动端导航组件如何基于内部路径判断当前高亮和返回的公开路径。

## Producers And Consumers
- Producer: `frontend/src/lib/device-routing.ts`
- Consumer: `frontend/src/app/mobile-user/layout.tsx`
- Consumer: `frontend/src/app/mobile-user/**` 中使用导航适配工具的页面与组件

## Interface Rules
- 公开路径 `/` 映射为内部路径 `/mobile-user`。
- 公开路径 `/jobs/:id`、`/companies/:id`、`/applications`、`/notifications`、`/profile`、`/login`、`/register` 保持语义不变，只增加 `/mobile-user` 前缀。
- 公开路径 `/resume/manage` 与 `/resume/upload` 统一映射到内部路径 `/mobile-user/resume`。
- 公开路径 `/skill-graph` 映射到内部路径 `/mobile-user/graph`。
- 内部移动端组件在读取 pathname 时，应先将 `/mobile-user/**` 还原为公开用户路径，再进行底部导航高亮和显示判断。

## Invariants
- `/mobile-user/**` 属于内部实现前缀，应始终被 `shouldBypassMobileRewrite` 排除，避免重写循环。
- `mapMobilePathToUserPath` 与 `mapUserPathToMobileInternalPath` 必须保持双向可逆。
- 移动端壳的底部导航显示规则依赖“还原后的公开用户路径”，不能直接以内部路径做判断。

## Compatibility Notes
- 路由迁移只改变代码落点，不改变上述路径契约。
- 如新增移动端专属路径，需先确认是否需要公开用户路径映射，再决定是否加入 `USER_TO_MOBILE_ROUTE_MAPPINGS`。
