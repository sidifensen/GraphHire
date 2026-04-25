# 用户职位详情页内联智能匹配设计

**日期**: 2026-04-25  
**范围**: `frontend` 用户端职位详情与匹配入口收敛

## 背景与目标

当前用户端存在 `/jobs/[id]`（职位详情）和 `/match/[id]`（匹配详情）两跳流程，用户在查看职位后还需跳转到匹配页才能看到匹配度与投递按钮，路径冗长。目标是将匹配流程收敛到职位详情页右侧卡片内，减少跳转并提升转化。

## 需求结论

1. 移除独立匹配页面及入口，所有“查看匹配”类入口统一进入 `/jobs/[id]`。
2. 职位详情页右侧新增智能匹配卡片，点击按钮后在当前页原地加载匹配数据。
3. 匹配加载成功后，主按钮从“开始智能匹配”切换为“立即投递”。
4. 点击“立即投递”后不再弹出简历选择，直接使用默认简历投递。
5. 若不存在默认简历，提示用户先设置默认简历，不发起投递。

## 方案选择

采用“彻底迁移并下线 `/match/[id]`”方案：

- 删除 `frontend/src/app/(user)/match/[id]/page.tsx` 及相关测试。
- 在 `frontend/src/app/(user)/jobs/[id]/page.tsx` 中合并匹配数据请求、匹配展示与投递动作。
- 更新所有指向 `/match/{jobId}` 的链接到 `/jobs/{jobId}`。

## 交互与状态设计

### 按钮状态机

- 初始态：`开始智能匹配`
- 匹配中：`匹配中...`（禁用）
- 匹配成功：`立即投递`
- 投递中：`投递中...`（禁用）

### 匹配卡片内容

- 初始态：说明文案 + 引导按钮
- 成功态：显示匹配度（百分比）、匹配等级、匹配技能与待提升技能
- 错误态：显示错误文案 + 重试按钮

### 投递行为

1. 请求 `resumeApi.getMyResumes()`。
2. 选取 `isDefault = true` 的简历。
3. 若找不到默认简历，展示“请先设置默认简历”。
4. 找到默认简历后调用 `personApi.apply({ jobId, resumeId })`。

## 数据流与接口

- 页面初始加载：`publicApi.jobs.getById(jobId)`
- 点击匹配后加载：
  - `matchApi.getGraphScore(user.id, jobId)`
  - `personApi.getMatchDetail(jobId)`（补充匹配原因，失败可降级）

## 错误处理

- 职位详情失败：沿用现有全页错误态。
- 匹配失败：仅匹配卡片区域显示错误，不影响职位详情阅读。
- 未登录：匹配/投递按钮提示登录后使用。
- 无默认简历：阻断投递并给出明确提示。

## 测试策略

1. 新增/改造职位详情页测试，覆盖：
   - 点击匹配后展示匹配结果
   - 匹配成功后按钮切换为立即投递
   - 立即投递使用默认简历
   - 无默认简历提示
2. 更新链接入口测试（通知、公司详情）到 `/jobs/{id}`。
3. 删除 `/match/[id]` 页面测试。

## 影响文件（预期）

- 修改：
  - `frontend/src/app/(user)/jobs/[id]/page.tsx`
  - `frontend/src/app/(user)/companies/[id]/page.tsx`
  - `frontend/src/app/(user)/notifications/page.tsx`
  - `frontend/src/components/UserLayout.tsx`（视路由规则可能仅做清理）
  - 相关测试文件
- 删除：
  - `frontend/src/app/(user)/match/[id]/page.tsx`
  - `frontend/src/tests/pages/match-detail.test.tsx`

## 非目标

- 不调整后端匹配/投递接口定义。
- 不改动企业端推荐流程与企业端职位详情。
