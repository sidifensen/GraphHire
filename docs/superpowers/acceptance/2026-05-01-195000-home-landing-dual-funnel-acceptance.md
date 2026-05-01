# Acceptance Criteria: 首页双入口落地页重构（科技理性 + 品牌高端）

**Spec:** `docs/superpowers/specs/2026-05-01-194447-home-landing-dual-funnel-design.md`
**Date:** 2026-05-01
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 首页首屏同时展示企业与求职双主 CTA：`免费发布职位`、`立即找工作` | UI interaction | 启动前端并访问 `/` | 首屏在无需滚动的可视区域内可同时看到两个按钮，且两个按钮都可点击 |
| AC-002 | 双主 CTA 为同层级主按钮，不出现“主次按钮”弱化关系 | UI interaction | 访问 `/` | 两个按钮在视觉上使用同等级按钮语法（相同字号层级、相近视觉权重） |
| AC-003 | 首页包含“信任背书条”并展示至少四项核心指标 | UI interaction | 访问 `/` | 页面在 Hero 后出现指标区域，至少有 4 项可读指标（如活跃企业/职位/匹配时长/响应率） |
| AC-004 | 页面存在企业价值流区块，至少包含 3 个步骤卡片 | UI interaction | 访问 `/` | 可读到企业侧流程卡片 3 项及对应收益描述 |
| AC-005 | 页面存在求职价值流区块，至少包含 3 个步骤卡片 | UI interaction | 访问 `/` | 可读到求职侧流程卡片 3 项及对应收益描述 |
| AC-006 | 页面存在“企业能力 vs 求职能力”对照式能力矩阵 | UI interaction | 访问 `/` | 页面可见双列能力对照区，左右列语义分别对应企业与求职 |
| AC-007 | 页面包含企业与求职双侧案例/口碑信息 | UI interaction | 访问 `/` | 案例区至少展示 1 条企业案例与 1 条求职案例 |
| AC-008 | 页面底部再次出现双 CTA 收口 | UI interaction | 滚动至页面底部 | 底部区域再次展示 `免费发布职位` 与 `立即找工作` |
| AC-009 | CTA 跳转路径符合既有路由约定 | UI interaction | 访问 `/` 并点击 CTA | 企业 CTA 指向企业注册/企业入口相关路径，求职 CTA 指向职位列表相关路径 |
| AC-010 | 移动端窄屏下双 CTA 采用纵向堆叠且均可点击 | UI interaction | 浏览器宽度设置为移动端（如 375px）并访问 `/` | 首屏双 CTA 纵向排列，每个按钮独立占位并可点击 |
| AC-011 | 首页实现不引入新的外链图标资源 | Logic | 检查首页相关实现文件与全局样式 | 首页相关变更未新增外链 Material Symbols/第三方图标 CDN URL |
| AC-012 | 落地页重构通过前端构建与测试验证 | Logic | 完成首页改造代码 | `npm run build` 成功且 `npm run test:run` 成功 |

## Coverage Notes

- Spec 第 3 节（7 区块信息架构）由 AC-001 到 AC-008 覆盖。
- Spec 第 5 节（交互）由 AC-009、AC-010 覆盖。
- Spec 第 6 节（视觉与组件一致性）由 AC-002、AC-003、AC-004、AC-005、AC-006 覆盖。
- Spec 第 7 节（Uiverse 借鉴落地）由 AC-003、AC-004、AC-005、AC-007 覆盖。
- Spec 第 8/9 节（技术边界与验证）由 AC-011、AC-012 覆盖。

## Execution Result

- 2026-05-01 实施完成并验证通过：
  - `npm run build` 通过
  - `npm run test:run` 通过（320 tests）
