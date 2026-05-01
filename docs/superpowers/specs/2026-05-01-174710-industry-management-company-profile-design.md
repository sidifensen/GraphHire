# 行业字典与企业资料编辑能力设计

- 时间：2026-05-01 17:47:10
- 目标：建立可维护的行业主数据；企业资料编辑时仅可选择已存在行业；新增企业主专属公司信息编辑能力；管理端新增行业管理页面与菜单。

## 1. 范围与目标

### 1.1 业务目标
1. 行业由独立行业表统一维护，不再由企业自由输入文本。
2. 企业端新增“公司信息编辑”页面与接口，且仅企业主（OWNER）可修改。
3. 管理端新增“行业管理”页面，并在左侧菜单新增入口。
4. 公司详情接口返回 `industryId + industryName`，支持前端点击行业后按行业筛选公司。

### 1.2 本次包含
1. 数据库：新增 `industry` 表；`company` 增加 `industry_id`；删除 `company.industry`。
2. 后端：行业管理接口、企业资料编辑接口、公司信息返回结构升级。
3. 前端：管理端行业管理页面与菜单；企业端公司资料编辑页面与入口。
4. 数据迁移：从当前 `company.industry` 值构建行业数据并回填 `industry_id`，再删旧列。

### 1.3 本次不包含
1. 行业删除能力（明确不允许删除，只允许停用）。
2. 其他与公司资料无关模块的重构。

## 2. 数据模型设计

### 2.1 新增行业表 `industry`
字段建议：
1. `id BIGSERIAL PRIMARY KEY`
2. `name VARCHAR(100) NOT NULL UNIQUE`
3. `enabled SMALLINT NOT NULL DEFAULT 1`（0-停用，1-启用）
4. `sort_order INT NOT NULL DEFAULT 0`
5. `create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
6. `update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
7. `deleted SMALLINT NOT NULL DEFAULT 0`

索引建议：
1. `uk_industry_name(name)`
2. `idx_industry_enabled_sort(enabled, sort_order)`

### 2.2 变更公司表 `company`
1. 新增 `industry_id BIGINT`。
2. 完成迁移后删除旧字段 `industry`。
3. 可选添加索引 `idx_company_industry_id(industry_id)`。

## 3. 数据迁移设计

### 3.1 迁移步骤
1. 创建 `industry` 表与迁移脚本。
2. 将现有 `company.industry` 去重值写入 `industry.name`。
3. 额外插入一批行业假数据（用于测试与演示）。
4. 通过 `UPDATE company c SET industry_id = i.id FROM industry i WHERE c.industry = i.name` 回填。
5. 校验 `company` 中原有非空 `industry` 均已映射到 `industry_id`。
6. 删除 `company.industry` 字段。

### 3.2 已识别现网行业值（用于首批迁移）
1. `互联网/人工智能`
2. `互联网服务`
3. `人力资源服务`
4. `软件服务`

### 3.3 回滚策略
1. 若回填校验失败，迁移停止，不执行删列。
2. 在同一迁移中保留校验 SQL 输出，失败即回滚事务。

### 3.4 MCP 执行说明（新增）
1. 当前环境 PostgreSQL MCP 已验证可用（`SELECT 1` 返回正常）。
2. 可使用 MCP 直接执行：行业表初始化、现有行业去重导入、`company.industry_id` 回填、迁移校验 SQL。
3. 正式结构变更仍以 `backend/src/main/resources/db/migration` 脚本为准；MCP 适用于开发联调与数据修复/预检。

## 4. 后端接口与权限设计

### 4.1 管理端行业接口
1. `GET /admin/industry/list`：查询行业列表（可按 `enabled` 过滤，按 `sort_order` + `id` 排序）。
2. `POST /admin/industry`：新增行业（名称唯一校验）。
3. `PUT /admin/industry/{id}`：编辑行业名称/排序。
4. `PUT /admin/industry/{id}/status`：启用/停用。
5. 不提供删除接口。

### 4.2 企业端公司资料接口
1. 新增 `PUT /company/profile`（JSON body）。
2. 入参包含：`name/contactName/contactPhone/contactEmail/description/website/industryId/scale/address`。
3. 校验：`industryId` 必须存在且 `enabled=1`。
4. 权限：仅 `OWNER` 可调用；`HR` 调用返回 403。

### 4.3 公司资料返回结构
1. `GET /company/info` 返回新增字段：`industryId`、`industryName`。
2. 其余公司展示相关接口按需补齐 `industryName`（优先覆盖企业端和公开公司卡片所需场景）。

## 5. 前端页面设计

### 5.1 管理端新增页面与菜单
1. 新增页面路由：`/admin/industry`。
2. Admin 侧边栏新增菜单项：`行业管理`。
3. 页面功能：列表、新增、编辑、启用/停用。
4. 列表字段：行业名称、状态、排序、更新时间、操作。

### 5.2 企业端新增公司资料编辑页面
1. 新增页面路由：`/enterprise/company/profile`。
2. 页面加载公司当前信息与可用行业列表。
3. 行业字段为下拉框，仅展示 `enabled=1` 的行业。
4. 保存提交 `industryId`，展示使用 `industryName`。

### 5.3 行业点击跳转搜索支持
1. 公司卡片/详情点击行业时，跳转参数使用 `industryId`。
2. 搜索页按 `industryId` 查询同业公司，避免名称变更导致筛选失效。

## 6. 应用层与持久层改造点

### 6.1 后端核心改造点
1. `CompanyPO` 新增 `industryId` 字段映射。
2. `Company` 领域模型新增/替换为 `industryId`（展示名由查询聚合时补充，不放入持久化主字段）。
3. `CompanyRepositoryImpl` 映射逻辑改造为 `industry_id`。
4. 新增 `Industry` 领域/PO/Repository/Service/Controller 链路。
5. `CompanyController` 新增企业主专属资料更新接口，复用 `assertOwner()`。

### 6.2 前端核心改造点
1. `admin` API 新增行业管理请求封装。
2. `companyApi` 新增企业资料更新接口与行业列表读取。
3. 企业端壳层导航新增“公司资料”入口（或在顶部账户菜单增加入口，按现有信息架构选择其一并保持一致）。

## 7. 校验与错误处理

1. 行业名重复：返回业务错误（400/业务码）。
2. 企业提交非法 `industryId`：返回参数校验错误。
3. 非 OWNER 调用资料更新：返回 403。
4. 停用行业不允许被新设置；已引用停用行业允许展示但不能继续被新选择。

## 8. 测试策略

### 8.1 后端
1. 行业接口单元/集成测试：新增、编辑、停用、重复名校验。
2. 企业资料更新接口测试：OWNER 成功、HR 拒绝、非法行业拒绝。
3. 迁移脚本测试：迁移后 `company.industry_id` 正确、旧列被删除。

### 8.2 前端
1. 管理端行业管理页：列表渲染、增改、状态切换。
2. 企业资料页：加载、下拉选择、保存成功/失败提示。
3. 行业点击跳转：使用 `industryId` 参数正确传递。

### 8.3 交付验证（按项目强制要求）
1. 前端：`npm run build`、`npm run test:run`。
2. 后端：`mvn compile`、`mvn test`。
3. 浏览器验证：使用 CDP 检查管理端行业页与企业端资料编辑页主流程。

## 9. 实施顺序建议

1. 数据库迁移（新增表/新增列/回填/删列）。
2. 后端行业管理与公司资料接口改造。
3. 前端管理端行业管理页面与菜单。
4. 前端企业资料编辑页面与入口。
5. 联调与全量验证。

## 10. 风险与缓解

1. 风险：迁移时存在未映射行业文本。
- 缓解：迁移前先执行去重扫描，迁移中校验未映射数量必须为 0。

2. 风险：删 `company.industry` 后旧代码仍访问该列。
- 缓解：先完成代码改造与测试，再执行删列迁移；或将删列置于最后一个迁移版本并确保前序版本全部通过。

3. 风险：行业停用后影响企业编辑。
- 缓解：停用仅影响新选择，不影响历史展示；页面提示“该行业已停用，请重新选择”。
