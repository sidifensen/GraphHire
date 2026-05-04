# Acceptance Criteria: 公司官网字段与联系邮箱移除

**Spec:** `docs/superpowers/specs/2026-05-04-154002-company-website-field-design.md`
**Date:** 2026-05-04
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | `company` 表包含 `website` 列 | API | 执行最新迁移后连接 PostgreSQL | `information_schema.columns` 查询包含 `company.website` |
| AC-002 | `company` 表不包含 `contact_email` 列 | API | 执行最新迁移后连接 PostgreSQL | `information_schema.columns` 查询不包含 `company.contact_email` |
| AC-003 | 企业主更新公司资料时可保存官网地址 | API | 企业主已登录，存在启用行业ID | `PUT /company/profile` 返回200，数据库 `company.website` 更新为提交值 |
| AC-004 | 企业资料查询返回官网地址且不返回联系邮箱 | API | 已执行 AC-003 | `GET /company/info` 返回 `website` 字段；`contactEmail` 字段不存在 |
| AC-005 | 公开公司详情接口返回官网地址 | API | 存在已认证公司且设置 `website` | `GET /public/companies/{id}` 返回 `website` 与数据库一致 |
| AC-006 | 企业端公司资料页不显示联系邮箱输入项 | UI interaction | 打开企业端公司资料页 | 页面无“联系邮箱”输入控件 |
| AC-007 | 用户端公司详情页展示公司官网 | UI interaction | 打开公司详情页且公司有官网 | 工商信息区出现“公司官网”，并展示可点击链接 |
