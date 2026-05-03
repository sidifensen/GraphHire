# User Company Page Real API Integration Design

**Date:** 2026-05-03
**Scope:** 用户端公司列表页 `/companies` 与公司详情页 `/companies/[id]`，并与职位页筛选体验对齐。

## 1. 背景与目标

当前用户端职位页已完成后端接口对接并支持地点/行业/规模等筛选；用户端公司页仍依赖 `MOCK_COMPANIES` 与 `MOCK_JOBS`，字段与筛选逻辑不基于真实数据。

本次目标：
- 公司列表与详情改为真实接口驱动。
- 地点筛选与职位页一致（热门地点 + 更多地点弹窗）。
- 行业筛选支持热门行业 + 更多行业弹窗，复用职位页行业弹窗结构。
- 公司规模筛选对接后端真实 `company.scale` 字段。
- 筛选条件使用本地持久化（`localStorage`）。
- 复用与抽取可共享组件，减少职位页与公司页重复代码。

## 2. 现状与约束

### 前端现状
- `frontend/src/app/(user)/jobs/page.tsx`：已对接 `/public/jobs`，已具备行业树与省市数据加载、行业/地点弹窗筛选。
- `frontend/src/app/(user)/companies/page.tsx`：使用 `MOCK_COMPANIES` 本地过滤。
- `frontend/src/app/(user)/companies/[id]/page.tsx`：使用 `MOCK_COMPANIES[0]` 与 `MOCK_JOBS`。

### 后端现状
- `/public/companies` 当前仅支持 `keyword/page/size`，返回字段主要为 `id/name/city/jobCount/summary/authStatus/avatarUrl`。
- 公司实体已具备 `industryId`、`scale`、`address`，职位公开筛选已具备 `industryLeafIds`、`companyScaleCode` 等规范。
- `/public/industries/tree` 与 `/public/geo/province-cities` 可直接复用。

### 约束
- 公司规模必须以数据库 `company.scale` 为准。
- 行业筛选必须基于后端行业树节点（叶子节点 ID）。
- 地点筛选与职位页体验保持一致。

## 3. 目标方案

### 3.1 后端接口扩展（PublicCompanyController）

扩展 `GET /public/companies`：
- 新增请求参数：
  - `industryLeafIds: List<Long>`
  - `companyScaleCode: String`
  - `cityList: List<String>`（支持多选城市）
- 保留原参数：`keyword/page/size`

扩展 `PublicCompanyCardResponse` 字段：
- 新增 `industryId`
- 新增 `industryName`
- 新增 `scale`

筛选规则：
- `industryLeafIds`：仅允许启用行业树叶子节点参与匹配；匹配 `company.industryId`。
- `companyScaleCode`：匹配 `company.scale` 编码。
- `cityList`：匹配公司卡片推导城市 `city`（来自已发布职位城市）。

兼容性：
- 未传新增参数时行为与当前一致。

### 3.2 前端 API 契约扩展（publicApi.companies.search）

`frontend/src/lib/api/public.ts`：
- 扩展 `Company` 类型字段：`industryId`、`industryName`、`scale`、`avatarUrl`。
- 扩展 `companies.search` 参数：`industryLeafIds`、`companyScaleCode`、`cityList`。

### 3.3 共享筛选能力抽取

从职位页抽取共享逻辑到 `frontend/src/features/user-filters/`：
- 共享常量：热门城市优先级、公司规模选项。
- 共享工具：城市名标准化、热门城市计算、树节点辅助函数。
- 共享 UI 组件：
  - 地点弹窗（省份-城市双列，多选）
  - 行业弹窗（三级树多选）

职位页与公司页共同使用该组件，减少重复维护。

### 3.4 公司列表页改造

`frontend/src/app/(user)/companies/page.tsx`：
- 移除 `MOCK_COMPANIES`。
- 页面初始化并发加载：
  - 行业树：`publicApi.jobs.getIndustryTree()`
  - 省市：`publicApi.jobs.getProvinceCities()`
- 热门地点：基于省市数据 + 热门优先级生成。
- 热门行业：基于行业树叶子节点 + 预置热门行业优先级生成（缺失项自动跳过）。
- 筛选构成：
  - `keyword`
  - `cityList`（多选）
  - `industryLeafIds`（多选）
  - `companyScaleCode`（单选）
- 触发查询：调用 `publicApi.companies.search({...})`。
- 本地持久化：
  - key：`graphhire.user.companies.filters.v1`
  - 持久化项：关键词、城市、行业、规模（存编码/名称安全值）
  - 启动时恢复；若树结构不再包含某叶子，自动剔除失效项。

### 3.5 公司详情页改造

`frontend/src/app/(user)/companies/[id]/page.tsx`：
- 使用路由参数 `id`。
- 请求 `publicApi.companies.getById(id)` 获取公司信息。
- 请求 `publicApi.jobs.search({ companyId: id, page: 1, size: N })` 获取在招职位。
- UI 改为真实字段：
  - 公司基础信息：名称、城市、简介、在招数量。
  - 在招职位列表：标题、薪资、地点。
- 删除 mock 专属展示块（如阶段、成立时间、伪造热招薪资）。

## 4. 错误处理与空态

- 列表页：
  - 加载中 skeleton。
  - 请求失败显示错误提示与重试入口。
  - 空数据展示“暂无符合条件的公司”。
- 详情页：
  - 非法 `id` 立即提示。
  - 公司不存在/未认证时展示错误态。
  - 在招职位为空时展示“暂无在招职位”。

## 5. 测试策略

### 后端集成测试（IT）
- 新增用例覆盖：
  - `industryLeafIds` 筛选有效。
  - `companyScaleCode` 筛选有效。
  - `cityList` 多城市筛选有效。
  - 响应包含 `industryId/industryName/scale`。

### 前端单测（Vitest + RTL）
- 新增公司列表页测试：
  - 首次渲染请求真实接口并渲染后端字段。
  - 行业/地点/规模筛选参数映射正确。
  - `localStorage` 持久化与恢复生效。
- 新增公司详情页测试：
  - 调用 `getById` 与 `jobs.search({companyId})`。
  - 渲染公司与职位数据。

## 6. 风险与应对

- 风险：行业树层级变更导致热门行业静态列表偏差。
  - 应对：热门行业仅作为优先展示，最终以树叶子集合过滤。
- 风险：历史本地筛选值失效。
  - 应对：恢复时做合法性校验，非法项自动丢弃。
- 风险：公司城市来自职位聚合，可能为空。
  - 应对：空城市不参与城市筛选命中，前端展示“地点待补充”。

## 7. 验收要点

- 公司列表/详情完全脱离 mock 数据。
- 公司筛选支持地点、行业、规模真实接口过滤。
- 地点与行业弹窗复用职位页逻辑，体验一致。
- 筛选刷新后保持（localStorage）。
- 前后端相关测试通过。
