# Acceptance Criteria: 用户端职位点击跳转匹配详情

**Spec:** `docs/superpowers/specs/2026-04-22-104845-user-job-click-match-detail-design.md`
**Date:** 2026-04-22
**Status:** Draft

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 在用户职位列表页中存在职位卡片时，用户点击任意职位卡片会跳转到对应的 `/match/{jobId}` 页面 | UI interaction | 前端已启动；访问 `/jobs`；职位列表接口返回至少一条 `id` 有效的职位数据 | 浏览器 URL 变为 `/match/{被点击职位id}`，并进入匹配详情页面而非停留在列表页 |
| AC-002 | 用户在职位列表页点击职位卡片时，跳转动作通过前端路由触发，不依赖页面硬刷新 | Logic | 前端测试环境中 mock `next/navigation` 的 `useRouter`；渲染 jobs 页面并注入职位数据 | 点击卡片后 `router.push` 被调用且参数精确等于 `/match/{jobId}` |
| AC-003 | 匹配详情页在职位详情接口返回 `requiredSkills` 时，页面展示“职位要求”区块并渲染全部技能标签 | UI interaction | 前端已启动；访问 `/match/{jobId}`；`/public/jobs/{jobId}` 返回 `requiredSkills` 非空；其余接口可返回正常或兜底数据 | 页面可见“职位要求”标题，且每个 `requiredSkills` 项都以标签文本出现 |
| AC-004 | 匹配详情页在职位详情接口无 `requiredSkills` 或为空数组时，展示明确降级文案 | Logic | 前端测试环境 mock 职位详情返回 `requiredSkills: []` 或 `undefined`；渲染匹配详情页 | 页面显示“该职位暂未提供结构化技能要求”且不抛出渲染错误 |
| AC-005 | 匹配详情页仍持续展示用户与职位匹配程度核心信息（总分、匹配技能信息） | UI interaction | 前端已启动；访问 `/match/{jobId}`；匹配相关接口返回可用数据 | 页面中可见“总匹配度”数值区以及“已匹配技能”“待补足技能”区域，不因新增职位要求区块而消失 |
| AC-006 | 当职位详情接口失败但匹配接口可用时，页面不白屏并可显示匹配模块内容 | UI interaction | 前端已启动；访问 `/match/{jobId}`；模拟 `/public/jobs/{jobId}` 请求失败、匹配接口成功 | 页面可渲染匹配详情主体内容；职位要求区域显示降级信息或不阻塞主流程；无未捕获错误弹窗导致页面不可用 |
| AC-007 | 本次改动不回归职位列表页既有加载态与错误态 | Logic | 前端测试运行现有 jobs 页面用例（含 loading/error） | jobs 页面测试保持通过，仍能显示“职位数据加载中...”与错误重试状态 |

