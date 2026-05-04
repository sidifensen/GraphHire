# 公司官网字段与联系邮箱移除设计

- 时间：2026-05-04 15:40:02
- 目标：将公司资料从“联系邮箱”迁移为“公司官网”，并在用户端公司详情展示官网。

## 1. 需求范围

1. 数据库 `company` 表新增 `website` 字段。
2. 数据库与后端移除 `contactEmail`（代码侧移除，数据库侧若存在 `contact_email` 则删除）。
3. 同步更新迁移脚本与 `backend/src/main/resources/db/schema.sql`。
4. 企业端公司资料编辑页移除“联系邮箱”输入，保留“公司官网”输入并可保存。
5. 用户端公司详情页的公司信息区域新增“公司官网”展示。

## 2. 数据层设计

1. 新增迁移：`V2026_05_04_023__company_add_website_and_drop_contact_email.sql`。
2. 迁移内容：
- `ALTER TABLE company ADD COLUMN IF NOT EXISTS website VARCHAR(500);`
- `ALTER TABLE company DROP COLUMN IF EXISTS contact_email;`
- `COMMENT ON COLUMN company.website IS '公司官网地址';`
3. `schema.sql` 中 `company` 表基线结构补齐 `website` 字段并更新注释。

## 3. 后端设计

1. `Company` 领域模型删除 `contactEmail`，保留 `website`。
2. `CompanyProfileUpdateRequest` 删除 `contactEmail`。
3. `CompanyProfileResponse` 删除 `contactEmail`，保留 `website`。
4. `CompanyAppService` 与 `CompanyController` 更新公司信息入参链路，去掉 `contactEmail`。
5. `CompanyPO` 增加 `website` 字段映射，仓储映射链路可读写官网。
6. 公共公司详情返回结构新增 `website`，供用户端详情展示。

## 4. 前端设计

1. 企业端 `enterprise/company/profile`：
- 表单移除 `contactEmail`。
- 保留 `website` 字段并提交到 `/company/profile`。
2. 用户端 `/(user)/companies/[id]`：
- 在工商信息区域新增“公司官网”行。
- 有值时渲染为可点击外链，无值显示“未披露”。
3. 类型定义同步：
- `frontend/src/lib/api/company.ts` 去掉 `contactEmail`。
- `frontend/src/lib/api/public.ts` 的 `Company` 增加 `website`。

## 5. 测试策略

1. 后端 IT：验证 `/company/profile` 可写入 `website` 且 `/company/info` 返回 `website` 且不再返回 `contactEmail`。
2. 后端 IT：验证 `/public/companies/{id}` 返回 `website`。
3. 前端测试：
- 企业端公司资料页不再显示“联系邮箱”。
- 用户端公司详情页展示“公司官网”并渲染链接。

## 6. 风险与缓解

1. 风险：历史调用方仍传 `contactEmail`。
- 缓解：后端接口改为忽略/不接收该字段，前端调用同步更新。
2. 风险：线上库存在历史 `contact_email`。
- 缓解：迁移脚本使用 `DROP COLUMN IF EXISTS`。
