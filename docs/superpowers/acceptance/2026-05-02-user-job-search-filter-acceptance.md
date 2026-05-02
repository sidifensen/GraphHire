# Acceptance Criteria: 用户端职位页筛选联调（职位类型/行业/地点）

**Spec:** `docs/superpowers/specs/2026-05-02-182412-user-job-search-filter-design.md`
**Date:** 2026-05-02
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 公开职位搜索接口支持 `positionTypeLeafIds` 多选过滤 | API | 已存在两个不同 `position_type_id` 的已发布职位 | 请求 `/public/jobs?positionTypeLeafIds=...` 时仅返回命中职位 |
| AC-002 | 公开职位搜索接口支持 `industryLeafIds` 多选过滤 | API | 已存在两个不同 `industry_id` 企业且各自有已发布职位 | 请求 `/public/jobs?industryLeafIds=...` 时仅返回命中企业职位 |
| AC-003 | 公开职位搜索接口支持 `cityList` 多选过滤 | API | 已存在多城市已发布职位 | 请求 `/public/jobs?cityList=北京&cityList=上海` 返回城市属于北京或上海的职位 |
| AC-004 | 公开职位搜索接口支持 `jobType` 单选过滤 | API | 已存在 `job_type=1/2/3` 的已发布职位 | 请求 `/public/jobs?jobType=3` 仅返回实习职位 |
| AC-005 | 公开职位搜索接口支持 `educationCode` 单选过滤 | API | 已存在 `education=2/3/4` 的已发布职位 | 请求 `/public/jobs?educationCode=4` 仅返回硕士岗位 |
| AC-006 | 公开职位搜索接口支持 `companyScaleCode` 单选过滤 | API | 已存在不同 `company.scale` 的企业及职位 | 请求 `/public/jobs?companyScaleCode=5` 仅返回规模编码 5 企业职位 |
| AC-007 | 新增公开职位类型树接口返回三层可用节点树 | API | `position_type` 表已有层级数据与状态字段 | 请求 `/public/position-types/tree` 返回 `id/name/level/children` 且只包含可用节点 |
| AC-008 | 新增公开行业树接口返回三层可用节点树 | API | `industry` 表已有层级数据与 enabled 字段 | 请求 `/public/industries/tree` 返回 `id/name/level/children` 且只包含启用节点 |
| AC-009 | 用户端职位页不再使用 mock 列表，改为调用公开职位搜索接口 | UI interaction | 打开 `/jobs` 页面，mock API 被替换为 public API mock | 首屏触发 `publicApi.jobs.search`，页面显示接口返回职位 |
| AC-010 | 职位类别“更多子类”弹窗支持三栏联动且孙分类可多选 | UI interaction | 页面已加载职位类型树 | 打开弹窗后左/中/右栏联动正常，右栏可多选多个孙分类并形成筛选条件 |
| AC-011 | 公司行业弹窗支持三栏联动且孙分类可多选 | UI interaction | 页面已加载行业树 | 打开弹窗后右栏可多选多个孙分类并形成筛选条件 |
| AC-012 | 工作地点弹窗支持省市两栏且城市可多选 | UI interaction | 页面加载内置省市数据 | 可同时选择多个城市并传入 `cityList` 参数 |
| AC-013 | 职位类型/学历/公司规模均为单选行为 | UI interaction | 页面已展示对应筛选项 | 在同一筛选项中选择新值会替换旧值，不会累计多选 |
| AC-014 | 筛选变化后请求参数映射正确 | UI interaction | 依次选择类别孙分类、城市、jobType、学历、行业孙分类、公司规模 | `publicApi.jobs.search` 的参数包含并仅包含对应字段和值 |
| AC-015 | 筛选无结果时页面展示空态，不报错 | UI interaction | 选择一组无匹配结果的筛选组合 | 页面显示“暂无匹配职位”或等价空态文案，且控制台无未捕获异常 |
