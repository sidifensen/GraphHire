---
type: module_card
title: company-profile-and-public-company-api
summary: 记录企业资料聚合、企业控制台资料接口与公开公司列表接口的当前基线。
tags:
  - backend
  - company
  - public-api
owned_paths:
  - backend/src/main/java/com/graphhire/job
  - backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicCompanyController.java
related_docs:
  - docs/superpowers/memory/contracts/company-avatar-and-public-company-card-contract.md
entrypoints:
  - backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java
  - backend/src/main/java/com/graphhire/job/application/service/CompanyAppService.java
  - backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyRepositoryImpl.java
  - backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicCompanyController.java
last_verified_commit: d525a2c
status: active
---

# 模块卡：企业资料与公开公司 API

## Responsibilities
- `CompanyController` 暴露企业控制台资料、认证材料、职位、员工和匹配相关接口，其中 `/company/info` 返回当前登录企业资料。
- `CompanyAppService` 负责企业资料聚合与更新，包括按用户查企业、按认证状态查企业、提交认证材料和更新企业基本信息。
- `CompanyRepositoryImpl` 负责 `company` 表和 `Company` 领域模型之间的映射，当前存在 `name <-> companyName`、`licenseUrl <-> licensePath`、`contactName <-> contact`、`contactPhone <-> phone` 的手工映射。
- `PublicCompanyController` 负责公开公司列表和公司详情接口，只返回已认证企业，并根据已发布职位补齐 `city`、`jobCount`、`summary`。

## Entry Points
- `backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java`
- `backend/src/main/java/com/graphhire/job/application/service/CompanyAppService.java`
- `backend/src/main/java/com/graphhire/job/infrastructure/persistence/repository/CompanyRepositoryImpl.java`
- `backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicCompanyController.java`
- `backend/src/main/resources/db/schema.sql`

## Invariants
- 企业控制台资料读取依赖当前登录用户通过 `company_staff` 反查所属企业，入口是 `CompanyAppService.getCompanyByUserId`。
- 公开公司列表和详情只暴露 `AuthStatus.VERIFIED` 的企业。
- `PublicCompanyCardResponse` 目前只包含 `id`、`name`、`city`、`jobCount`、`summary`、`authStatus` 六个字段，没有头像字段。
- `company` 表当前没有头像列，RustFS 相关字段仅有 `license_path`。

## Extension Points
- 若企业资料要新增头像、封面等静态资源字段，需要同时更新领域模型、PO 映射、迁移脚本和公开卡片 DTO。
- 若公开公司列表要直接展示媒体资源，优先沿用现有后端代理读取模式，而不是让前端直接消费 `s3://` 路径。
- 若企业控制台后续加入资料编辑页，可在 `/company/info` 周边补充文件上传接口，而不必改动职位和员工子路由。

## Common Pitfalls
- 只改 `Company` 领域模型但不改 `CompanyPO` / `CompanyRepositoryImpl`，字段会在持久化时丢失。
- 直接把 `s3://bucket/key` 暴露给公开接口会导致浏览器无法直接显示图片。
- 忽略 `PublicCompanyController` 的公开认证约束，会把未审核企业的信息提前暴露出去。
