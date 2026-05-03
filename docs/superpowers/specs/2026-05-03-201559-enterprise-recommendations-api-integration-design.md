# 企业端推荐页后端真实对接设计

**日期**: 2026-05-03
**目标页面**: `frontend/src/app/enterprise/recommendations/page.tsx`

## 1. 背景与目标

当前企业端推荐页仍使用 `mockJobs/mockCandidates` 静态数据，核心交互（职位切换、候选人推荐、一键邀请）未对接真实后端。目标是在尽量保持现有 UI 样式不变的前提下，完成以下能力：

- 左侧职位列表改为企业真实职位（优先展示已发布岗位）
- 右侧候选人列表按当前岗位读取真实推荐
- 顶部主动作从“`一键邀请`”改为“`一键匹配所有候选人`”，触发后端匹配计算
- 提供刷新能力，支持重新拉取岗位与候选人数据
- 候选人卡片展示综合匹配度、技能匹配度、岗位要求匹配度，以及候选人技能信息

## 2. 约束与边界

- 保持现有布局结构、色彩体系、卡片样式和交互节奏不做大改，仅做最小必要文案与功能改造。
- 后端接口优先复用已有：
  - `GET /company/job/list`
  - `GET /company/recommend/resumes?jobId=`
  - `POST /company/job/{id}/match/trigger`
- 推荐返回中的候选人补充信息（技能/学历/经验）若现有响应不完整，允许后端最小扩展 `MatchDetailResponse` 字段，不新增表结构。
- 不引入新页面路由，不改企业端导航契约。

## 3. 现状分析

### 3.1 前端现状

- 推荐页完全依赖 mock 数据。
- “刷新”仅做本地 loading 动画，没有请求后端。
- 主按钮“`一键邀请`”不触发业务接口。
- 卡片已有展示匹配信息的容器，但字段来源不是后端真实值。

### 3.2 后端现状

- `CompanyController` 已支持：
  - 企业职位列表查询
  - 单岗位匹配触发
  - 推荐简历查询（支持按 `jobId`）
- `MatchDetailResponse` 已含分数字段 `score.total/skillScore/requirementScore`，但简历技能、学历、经验等展示字段未直接返回。

## 4. 方案对比

### 方案 A（推荐，最小变更）

- 前端直接消费既有接口；
- 后端仅在 `MatchDetailResponse.ResumeBasicInfo` 中增加展示型字段（`skills`、`education`、`experience`），从 `Resume.parseResult` 解析填充；
- 推荐页卡片改用真实分数与解析字段。

优点：改动集中、风险低、满足当前页面需求。  
缺点：`parseResult` 结构多样，需要做容错解析。

### 方案 B（纯前端拼装）

- 不改后端，前端二次请求多个接口拼接候选人详情。

优点：后端零改动。  
缺点：前端请求链复杂，性能与一致性差，且当前无直接“按 resumeId 拉技能摘要”的企业接口。

### 方案 C（新增企业推荐聚合接口）

- 后端新增专用聚合 API，一次返回推荐页所需全部字段。

优点：契约清晰。  
缺点：超出“尽量复用现有接口”的范围，开发成本高。

## 5. 采用方案

采用 **方案 A**。

## 6. 详细设计

### 6.1 前端数据流

1. 页面加载：
- 调用 `companyApi.getJobList()` 拉取企业职位；
- 过滤可推荐岗位（优先 `PUBLISHED`）；
- 选中逻辑：优先 URL `jobId`，否则首个可用岗位。

2. 岗位切换：
- 更新 `selectedJobId`；
- 调用 `companyApi.getRecommendedResumes({ jobId })`。

3. 一键匹配：
- 调用 `companyApi.triggerJobMatch(jobId)`；
- 成功后自动刷新当前岗位推荐。

4. 刷新按钮：
- 重新请求职位与当前岗位推荐。

### 6.2 前端展示映射

- 综合匹配度：`Math.round(item.score?.total ?? 0)`
- 技能匹配度：`Math.round(item.score?.skillScore ?? 0)`
- 岗位要求匹配度：`Math.round(item.score?.requirementScore ?? 0)`
- 候选人名称：`resume.userName || resume.fileName || 候选人#id`
- 技能标签：`resume.skills`（后端新增字段）
- 学历/经验：`resume.education`、`resume.experience`（后端新增字段）

### 6.3 后端扩展

在 `MatchDetailResponse.ResumeBasicInfo` 增加可选字段：

- `List<String> skills`
- `String education`
- `String experience`

解析来源：`Resume.parseResult` JSON；优先 keys：

- skills: `skills`（数组）
- education: `education`（字符串或数组首项）
- experience: `experience`（字符串或数组长度推导“X段经历”）

使用 Hutool `JSONUtil/JSONObject/JSONArray` 做容错解析，异常时回退空值，不影响主流程。

## 7. 错误处理

- 任一接口失败：页面保留现有结构，展示轻量错误文案，不清空已加载的可用数据。
- “一键匹配”处理中禁用按钮，防止重复点击。
- 无岗位或无候选人时展示空态文案。

## 8. 测试策略

- 前端 Vitest：
  - 推荐页加载后调用职位接口与推荐接口
  - URL `jobId` 选中生效
  - 点击“一键匹配所有候选人”调用 trigger 接口并刷新
  - 卡片展示三种匹配度
- 后端单测：
  - `MatchDetailResponse` 对 `parseResult` 的 skills/education/experience 提取
  - 缺失或非法 JSON 时返回空字段

## 9. 影响评估

- 影响模块：
  - `frontend/src/app/enterprise/recommendations/page.tsx`
  - `frontend/src/lib/types/enterprise.ts`
  - `backend/src/main/java/com/graphhire/match/interfaces/dto/response/MatchDetailResponse.java`
- 无数据库结构改动。
- 路由与权限模型不变。

## 10. 完成标准

- 推荐页不再依赖 mock 数据；
- 主按钮文案与行为改为“一键匹配所有候选人”；
- 左侧职位与右侧候选人联动真实可用；
- 卡片稳定展示综合/技能/岗位要求三类匹配度与候选人技能。
