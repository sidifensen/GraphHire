---
type: contract
title: company-avatar-and-public-company-card-contract
summary: 记录企业头像上传、企业资料读取与公开公司卡片返回值之间的契约边界。
tags:
  - backend
  - company
  - contract
owned_paths:
  - backend/src/main/java/com/graphhire/job/interfaces/controller/CompanyController.java
  - backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicCompanyController.java
status: active
last_verified_commit: d525a2c
---

# 契约：企业头像与公开公司卡片

## Current Providers
- `GET /company/info` 返回当前登录企业的完整领域对象 `Company`。
- `PUT /company/info` 通过请求参数更新企业名称、联系人、电话、邮箱、简介和官网。
- `GET /public/companies` 返回分页 `PublicCompanyCardResponse`，供用户端公司列表消费。
- `GET /public/companies/{id}` 返回单个 `PublicCompanyCardResponse`，供用户端公司详情头部消费。

## Current Payload Shape
- `Company` 当前关键字段包括 `id`、`userId`、`name`、`unifiedSocialCreditCode`、`licenseUrl`、`contactName`、`contactPhone`、`contactEmail`、`description`、`website`、`industry`、`scale`、`address`、`authStatus`。
- `PublicCompanyCardResponse` 当前关键字段包括 `id`、`name`、`city`、`jobCount`、`summary`、`authStatus`。

## Storage Boundary
- 企业资料持久化在 `company` 表，PO 映射位于 `CompanyPO` 与 `CompanyRepositoryImpl`。
- 对象存储客户端统一走 `RustFSClient`，当前 `upload(byte[], fileName)` 会在对象 key 前再拼接时间戳。
- 用户头像读取采用“数据库存储 `s3://bucket/key` + 后端公开代理下载”的模式，企业头像应优先复用这条链路。

## Compatibility Notes
- 若新增企业头像字段，公开公司列表与企业资料接口应返回可直接供浏览器显示的 URL，而不是 `s3://` 原始路径。
- 若上传对象名策略调整为长随机串，应优先在上传入口或 RustFS 客户端统一收口，避免不同业务重复造 key 生成逻辑。
