# 用户端职位页筛选联调设计（职位类型/行业/地点）

## 1. 背景与目标
- 现状：`frontend/src/app/(user)/jobs/page.tsx` 使用本地 mock 数据与本地筛选，不走后端真实查询。
- 目标：用户端职位页接入后端真实职位搜索，支持你要求的筛选能力：
  - 职位类别：来自 `position_type` 表，弹窗三栏（左：父分类，中：子分类，右：孙分类），仅孙分类可多选。
  - 工作地点：省/市两级弹窗（左：省，右：市），城市可多选。
  - 职位类型：`jobType`（全职/兼职/实习）单选。
  - 学历要求：单选（编码 1-5）。
  - 公司行业：来自 `industry` 表，弹窗三栏，孙分类可多选。
  - 公司规模：单选（编码 1-6）。
- 约束：除地点、职位类别孙分类、公司行业孙分类外，其他筛选均为单选。

## 2. 方案总览
采用“用户端公开筛选元数据接口 + 扩展公开职位搜索接口 + 前端筛选状态驱动查询”的方案。

### 2.1 后端新增/扩展接口
1) `GET /public/jobs`（扩展）
- 新增请求参数：
  - `positionTypeLeafIds`：`List<Long>`，职位类别孙分类 ID 列表（多选）
  - `cityList`：`List<String>`，工作地点城市列表（多选）
  - `jobType`：`Integer`，1=全职 2=兼职 3=实习（单选）
  - `educationCode`：`Integer`，1=中专 2=大专 3=本科 4=硕士 5=博士（单选）
  - `industryLeafIds`：`List<Long>`，公司行业孙分类 ID 列表（多选）
  - `companyScaleCode`：`String`，1-6（单选）
- 保留原参数：`keyword/companyId/city/salaryMin/salaryMax/skills/sortBy/page/size`
- 过滤语义：
  - 多选字段使用 `IN`；单选字段使用 `=`。
  - `positionTypeLeafIds` / `industryLeafIds` 只接受叶子节点 ID；非叶子节点忽略。
  - `city` 与 `cityList` 同时存在时，以 `cityList` 为准。

2) `GET /public/position-types/tree`
- 返回启用状态的职位类型树（最多三层），供用户端筛选弹窗使用。
- 输出结构：`id/name/parentId/level/children`。

3) `GET /public/industries/tree`
- 返回启用状态的行业树（最多三层），供用户端筛选弹窗使用。
- 输出结构：`id/name/parentId/level/children`。

### 2.2 前端改造
1) `frontend/src/lib/api/public.ts`
- 扩展 `jobs.search` 参数类型。
- 新增 `getPositionTypeTree`、`getIndustryTree`。

2) `frontend/src/app/(user)/jobs/page.tsx`
- 移除 mock 列表数据依赖，改为请求 `publicApi.jobs.search`。
- 增加筛选状态模型：
  - `selectedPositionTypeLeafIds: number[]`
  - `selectedIndustryLeafIds: number[]`
  - `selectedCities: string[]`
  - `selectedJobType?: number`
  - `selectedEducationCode?: number`
  - `selectedCompanyScaleCode?: string`
- 新增两个弹窗：
  - 职位类别弹窗：三栏级联，右栏孙分类可多选。
  - 公司行业弹窗：三栏级联，右栏孙分类可多选。
- 工作地点弹窗：省/市两栏（前端静态省市数据），右栏城市多选。
- 其他筛选（职位类型/学历/公司规模）：单选 chips。
- 每次筛选变化后触发列表请求，并回显“已选条件”标签。

3) 数据映射
- 职位卡片继续使用现有展示结构；公司名/城市/薪资等来自 `/public/jobs` 返回。

## 3. 后端查询实现设计

### 3.1 查询策略
沿用 `PublicJobController.searchJobs` 当前“轻筛选走 DB、复杂筛选走内存过滤”的架构：
- 当包含 `skills/companyId/positionTypeLeafIds/industryLeafIds/cityList/jobType/educationCode/companyScaleCode` 任一复杂参数时，走“拉取已发布职位 + Java 内存过滤 + 排序分页”。
- 否则走 `jobRepository.searchPublishedJobs` 现有 DB 分页逻辑。

### 3.2 关键过滤规则
- 职位类别：`job.positionTypeId ∈ positionTypeLeafIds`。
- 公司行业：先构建 `companyId -> industryId`，再筛 `industryId ∈ industryLeafIds`。
- 公司规模：先构建 `companyId -> scale`，再筛 `scale == companyScaleCode`。
- 城市多选：`job.location.city ∈ cityList`。
- 学历：`job.education == educationCode`。
- 职位类型：`job.jobType == jobType`。

### 3.3 元数据树接口实现
- 复用 `IndustryAppService` / `PositionTypeAppService` 查询全部节点。
- 仅返回可用节点（行业 `enabled=1`；职位类型 `status=1`）。
- 构建树结构并按 `sort`/`sortNo` 排序。

## 4. 错误处理与边界
- 空筛选：返回全部已发布职位。
- 筛选值非法：忽略该项并继续查询（不 400），保证用户端容错。
- 叶子节点校验：后端只对叶子节点生效，非叶子 ID 自动剔除。
- 返回空列表：前端展示“暂无匹配职位”。

## 5. 测试策略（TDD）

### 5.1 后端
- 扩展 `PublicJobControllerIT`：
  - `positionTypeLeafIds` 过滤生效
  - `industryLeafIds` 过滤生效
  - `cityList` 多选生效
  - `jobType/educationCode/companyScaleCode` 生效
- 新增公开树接口 IT：
  - `GET /public/position-types/tree` 返回树结构
  - `GET /public/industries/tree` 返回树结构

### 5.2 前端
- 新增 `user-jobs-page.test.tsx`：
  - 点击“更多职类”打开弹窗并可多选孙分类。
  - 选择公司行业孙分类可多选。
  - 工作地点可多选城市。
  - 其他筛选为单选（再次选择覆盖原值）。
  - 筛选参数正确传给 `publicApi.jobs.search`。

## 6. 交付清单
- 后端：公开筛选元数据接口 + 职位搜索扩展参数。
- 前端：职位页真实接口改造 + 三类弹窗筛选交互（职位类别/公司行业/地点）。
- 测试：后端 IT + 前端页面测试。
- 文档：验收标准、实现计划、Release Notes。
