# Acceptance Criteria: 用户端能力图谱探索交互升级

**Spec:** `docs/superpowers/specs/2026-04-22-191500-user-skill-graph-exploration-design.md`
**Date:** 2026-04-22
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 图谱页面加载时调用正式接口获取技能数据 | Logic | `personApi.getGraph` 可被 mock | 页面挂载后 `personApi.getGraph` 被调用 1 次 |
| AC-002 | 接口加载中时显示加载文案 | UI interaction | `personApi.getGraph` 返回 pending Promise | 页面显示“图谱数据加载中...” |
| AC-003 | 接口失败时显示错误信息和重试按钮 | UI interaction | `personApi.getGraph` 抛出异常 | 页面显示错误文案，存在“重试”按钮 |
| AC-004 | 技能为空时显示空态文案 | UI interaction | `personApi.getGraph` 返回 `{ skills: [] }` | 页面显示“暂无技能图谱数据，请先上传并解析简历。” |
| AC-005 | 技能存在时展示力导向图谱容器 | UI interaction | `personApi.getGraph` 返回非空 skills | 页面渲染图谱容器并隐藏空态 |
| AC-006 | 页面提供重置视图操作入口 | UI interaction | 图谱已渲染 | 页面存在“重置视图”按钮 |
| AC-007 | 点击重置视图会调用图谱实例缩放回归方法 | Logic | 图谱组件实例方法可被 mock | 点击按钮后触发 `zoomToFit` 或等价重置方法 |
| AC-008 | 图谱右侧状态卡显示节点与连线统计 | UI interaction | skills 非空 | 状态卡显示“节点数/连线数”且数值与映射结果一致 |
| AC-009 | 悬浮节点时状态卡展示当前聚焦节点名称 | Logic | 图谱触发节点悬浮回调 | 状态卡“当前聚焦节点”更新为悬浮节点名称 |
| AC-010 | 页面在移动端宽度下不出现主容器横向溢出 | UI interaction | 浏览器宽度 375px | 主容器可见区域内无明显横向裁切与不可达按钮 |
