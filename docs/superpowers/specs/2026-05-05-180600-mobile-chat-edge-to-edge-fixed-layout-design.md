# 移动端聊天外层留白与固定布局优化设计

## 目标
针对用户端与企业端手机版聊天页统一优化布局：
1. 页面最外层内边距清零。
2. 聊天主卡片外层圆角改为直角。
3. 详情页内顶部信息区与底部输入区固定，中间消息区独立滚动。

## 设计方案
- 继续复用 `ChatWorkspace` 作为用户端与企业端共用组件。
- 通过移动端默认类 + `md` 断点类实现“移动端直角/无留白、桌面端保留原样”。
- 在 `mobileMode=detail` 下给详情面板设置 `h-[100dvh]` 与 `overflow-hidden`，并将结构明确为：
  - `header`：`shrink-0` 固定顶栏
  - `message container`：`flex-1 min-h-0 overflow-y-auto` 仅中间滚动
  - `footer`：`shrink-0` 固定底部输入区

## 影响范围
- 用户端：`/chat`、`/chat/[conversationId]`
- 企业端：`/enterprise/chat`、`/enterprise/chat/[conversationId]`

## 验证策略
- 扩展 `chat-workspace-redesign` 测试覆盖上述 3 类布局行为。
- 执行 `npm run test:run -- src/tests/pages/chat-workspace-redesign.test.tsx` 与 `npm run build`。
