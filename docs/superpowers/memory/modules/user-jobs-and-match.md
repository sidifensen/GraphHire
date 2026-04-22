# 模块卡：用户职位与匹配详情

## 责任边界
- 职位列表页负责搜索/展示职位卡片，并处理用户点击行为。
- 匹配详情页负责聚合职位信息、匹配结果、技能匹配可视化及投递动作。
- 后端公共职位接口提供职位基础信息（含 requiredSkills）。
- 后端匹配接口提供用户与职位的匹配分、匹配技能和缺失技能。

## 关键文件
- 前端列表页：`frontend/src/app/(user)/jobs/page.tsx`
- 前端详情页：`frontend/src/app/(user)/match/[id]/page.tsx`
- 前端 API：`frontend/src/lib/api/public.ts`、`frontend/src/lib/api/match.ts`、`frontend/src/lib/api/person.ts`
- 后端职位接口：`backend/src/main/java/com/graphhire/publicapi/interfaces/controller/PublicJobController.java`
- 后端个人匹配接口：`backend/src/main/java/com/graphhire/resume/interfaces/controller/PersonController.java`

## 当前稳定约束
- 列表页当前使用 `/public/jobs` 查询职位。
- 匹配详情页路由参数 `[id]` 实际按 `jobId` 使用。
- 匹配详情页已同时请求 `/person/match/{jobId}` 与 `/public/jobs/{id}`；`/match/person/{personId}/job/{jobId}/graph-score` 仅在登录用户存在时调用。
- 任一数据源失败时前端已有兜底文案，不应导致整体白屏。

## 风险点
- 路由语义是“match”，但承载了职位详情能力；后续若新增 `/jobs/[id]` 需考虑迁移兼容。
- 职位 requiredSkills 可能为空，页面必须保持可读降级。
