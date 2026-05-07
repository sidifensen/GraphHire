# Acceptance Criteria: 聊天桌面端雾面组件化改版

**Spec:** `docs/superpowers/specs/2026-05-07-235500-chat-desktop-frosted-components-design.md`
**Date:** 2026-05-07
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | 桌面端聊天工作台根容器启用雾面风格主壳类名并保留原 data-testid。 | UI interaction | 打开用户端或企业端聊天页，窗口宽度 >= 768px。 | `chat-workspace` 节点包含雾面壳类（含渐变背景/blur/shadow标识），页面正常渲染无报错。 |
| AC-002 | 会话列表面板桌面端去重边框，选中态不依赖高对比描边。 | UI interaction | 存在至少 1 条会话。 | 会话列表面板与列表项类名符合低边框策略（弱边框或透明边框 + 背景高亮），选中项可被清晰识别。 |
| AC-003 | 详情区头部与输入区以组件方式渲染且视觉为雾面块，不影响返回按钮与查看职位链接行为。 | UI interaction | 用户端和企业端各进入一条会话详情。 | 头部和输入区分别通过独立组件渲染，`chat-mobile-back-button` 与“查看职位”链接行为与原逻辑一致。 |
| AC-004 | 消息流保持文本/图片/简历/面试通知渲染与操作能力，样式升级为低边框气泡。 | UI interaction | 构造四类消息数据并加载会话。 | 各类型消息都可渲染；简历可预览与下载；图片可缩略显示与预览；面试通知内容完整，气泡样式为新方案。 |
| AC-005 | 表情面板与发送区拆分为独立组件后仍可插入表情并发送文本。 | UI interaction | 打开聊天页输入区，存在可发送会话。 | 点击表情按钮可打开面板并写入输入框；点击发送触发 `chatApi.sendText`，消息列表刷新。 |
| AC-006 | 移动端分离布局回归不退化。 | Logic | 运行既有移动端聊天测试用例。 | 原有关于 list/detail 分离、固定头尾、滚动容器、返回按钮的断言全部通过。 |
| AC-007 | 本次前端改动面完整验证通过。 | Logic | 代码与测试已更新。 | `npm run test:run`、`npm run build` 均成功退出（exit code 0）。 |