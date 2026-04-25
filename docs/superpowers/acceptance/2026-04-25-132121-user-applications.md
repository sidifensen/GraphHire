# Acceptance Criteria: 用户端投递记录页面

**Spec:** `docs/superpowers/specs/2026-04-25-132121-user-applications-design.md`
**Date:** 2026-04-25
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 访问 `/applications` 时页面展示“投递记录”标题与列表容器 | UI interaction | 用户已登录且接口返回至少 1 条投递记录 | 页面可见标题“投递记录”，并至少渲染 1 条记录卡片 |
| AC-002 | 每条记录显示职位名、公司名、状态、投递时间、匹配分字段 | UI interaction | 用户已登录且返回记录包含上述字段 | 单条记录同时出现职位名、公司名、状态标签、格式化时间与匹配分；匹配分缺失显示 `-` |
| AC-003 | 点击状态筛选后仅展示对应状态的数据 | UI interaction | 用户已登录且返回列表包含多种状态 | 选择某状态后，仅该状态记录可见，其他状态记录不可见 |
| AC-004 | 切换状态筛选时分页重置为第 1 页 | Logic | 当前页大于 1 且切换筛选项 | 切换后当前页为 1，并展示筛选后的第一页数据 |
| AC-005 | 当过滤后总数超过每页条数时显示分页控件 | UI interaction | 用户已登录且某筛选结果数量 > 10 | 页面显示分页按钮/页码，可进行页切换 |
| AC-006 | 点击分页按钮后列表展示对应页的数据切片 | UI interaction | 用户已登录且至少有 2 页数据 | 选择第 N 页后，仅显示第 N 页数据，且不显示其他页条目 |
| AC-007 | 用户未登录时页面展示登录提示并不请求数据 | Logic | `authStore.user` 为空 | 页面显示“请先登录后查看投递记录”，投递记录接口未被调用 |
| AC-008 | 数据请求失败时展示错误信息与重试入口 | UI interaction | 用户已登录且接口首次请求抛错 | 页面显示错误文案与“重试”按钮 |
| AC-009 | 点击重试后重新请求并可恢复显示列表 | UI interaction | 首次请求失败，重试时接口返回成功 | 重试后错误态消失并显示记录列表 |
| AC-010 | 用户侧边栏“投递记录”入口指向 `/applications` | Logic | 渲染用户侧边栏组件 | “投递记录”链接 href 等于 `/applications` |
| AC-011 | 用户端布局在 `/applications` 路由显示用户侧边栏 | Logic | `pathname` 为 `/applications` | 布局渲染 `UserSidebar` 组件 |
