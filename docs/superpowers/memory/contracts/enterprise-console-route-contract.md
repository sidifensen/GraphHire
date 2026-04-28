---
type: contract
title: enterprise-console-route-contract
summary: 约束企业端公开路由集合、导航语义和认证前提。
tags:
  - frontend
  - enterprise
  - routing
owned_paths:
  - frontend/src/app/enterprise
  - frontend/src/components/enterprise/EnterpriseHeader.tsx
related_docs:
  - docs/superpowers/memory/modules/enterprise-console-shell.md
entrypoints:
  - frontend/src/app/enterprise/layout.tsx
  - frontend/src/components/enterprise/EnterpriseHeader.tsx
last_verified_commit: c6cbb51
status: active
---

# 契约：企业端公开路由与导航

## Scope
- 企业端当前公开页面路径集合。
- 顶部导航与公开路由之间的语义映射。
- 访问企业端页面时必须满足的认证前提。

## Producers And Consumers
- Producer: `frontend/src/app/enterprise/**`
- Producer: `frontend/src/components/enterprise/EnterpriseHeader.tsx`
- Consumer: 企业端页面测试与后续移动端重写逻辑

## Interface Rules
- 当前企业端公开路由包括：
  - `/enterprise/dashboard`
  - `/enterprise/jobs`
  - `/enterprise/jobs/new`
  - `/enterprise/jobs/:id`
  - `/enterprise/jobs/:id/edit`
  - `/enterprise/recommendations`
  - `/enterprise/employees`
  - `/enterprise/notifications`
- 顶部导航的主入口只覆盖 `/enterprise/dashboard`、`/enterprise/jobs`、`/enterprise/recommendations`、`/enterprise/employees`。
- `/enterprise/notifications` 是公开页面，但不属于顶部主导航入口。
- 企业端 layout 只应在企业身份有效时渲染；若身份缺失或 `authApi.getContext()` 返回非 `COMPANY`，必须跳转 `/login`。

## Invariants
- 企业端公开路径前缀固定为 `/enterprise`，后续内部实现不应改变该前缀对外语义。
- 子页面应保持当前语义不变，移动端实现如需隐藏内部前缀，应建立公开路径到内部路径的双向映射。
- 公开路径契约变更时，`EnterpriseHeader` 导航和测试用例都需要同步更新。

## Compatibility Notes
- 可以新增企业端内部移动实现前缀，但不应破坏现有 `/enterprise/**` 公开地址。
- 若后续将通知中心加入主导航，需要同时更新这里的导航语义说明与头部组件测试。
