---
type: module_card
title: mobile-user-app-shell
summary: 记录移动端内部路由壳与页面实现的目录边界，避免继续依赖遗留 mobile-user-page 目录。
tags:
  - frontend
  - mobile-user
owned_paths:
  - frontend/src/app/mobile-user
  - frontend/src/lib/device-routing.ts
related_docs:
  - docs/superpowers/memory/contracts/mobile-user-internal-routing-contract.md
entrypoints:
  - frontend/src/app/mobile-user/layout.tsx
  - frontend/src/app/mobile-user/page.tsx
  - frontend/src/lib/device-routing.ts
last_verified_commit: 79d3358
status: active
---

# 模块卡：移动端用户路由壳

## Responsibilities
- `frontend/src/app/mobile-user/**` 承载隐藏的移动端内部实现路由，供用户端公开路由在手机访问时重写进入。
- `layout.tsx` 负责注入移动端样式和统一壳组件，并控制底部导航显示。
- 路由页面文件负责作为 Next App Router 入口，页面实现与共享组件应与该路由目录同域维护。
- `frontend/src/lib/device-routing.ts` 负责公开用户路由与 `/mobile-user/**` 内部路由之间的双向映射。

## Entry Points
- `frontend/src/app/mobile-user/layout.tsx`
- `frontend/src/app/mobile-user/page.tsx`
- `frontend/src/app/mobile-user/jobs/page.tsx`
- `frontend/src/app/mobile-user/companies/[id]/page.tsx`
- `frontend/src/lib/device-routing.ts`

## Invariants
- 移动端内部实现始终使用 `/mobile-user` 作为隐藏前缀，不直接暴露给桌面端公开导航。
- 移动端共享样式只应在 `frontend/src/app/mobile-user/layout.tsx` 中统一引入一次。
- `frontend/src/app/mobile-user/**` 不应继续依赖 `frontend/src/mobile-user-page/**` 这类遗留目录。
- 旧的独立入口文件（如 `main.tsx`、`App.tsx`）不再参与当前 Next 前端运行链路。

## Extension Points
- 新增移动端页面时，在 `frontend/src/app/mobile-user/**` 下增加对应路由与共享组件，并同步更新 `frontend/src/lib/device-routing.ts` 的路径映射。
- 需要共享移动端组件时，优先放在 `frontend/src/app/mobile-user/_components`、`_hooks`、`_data`、`_lib` 等私有目录中。
- 若底部导航增加入口，需要同时更新壳组件中的可见路径判断与导航项定义。

## Common Pitfalls
- 只移动页面文件、不清理旧目录引用，最终会留下双份实现和死代码。
- 修改公开用户路径但不更新 `device-routing` 映射，会导致移动端重写或返回路径失效。
- 将共享实现散落到多个路由目录，会让后续维护重新退回到跨目录耦合状态。
