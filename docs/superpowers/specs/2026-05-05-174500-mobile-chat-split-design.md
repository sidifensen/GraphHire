# 移动端聊天列表详情分离设计

## 背景与目标
当前用户端与企业端移动端聊天页在同一屏同时展示会话列表与聊天详情，导致可读性和操作路径不符合移动端单任务流。目标是在两个端统一为“先列表，后详情”的单栏流程，同时修复移动端图片消息溢出和页面内边距过大问题。

## 需求范围
- 用户端 `/chat` 与企业端 `/enterprise/chat`：移动端仅展示会话列表。
- 用户端 `/chat/[conversationId]` 与企业端 `/enterprise/chat/[conversationId]`：移动端仅展示聊天详情。
- 聊天详情头部新增左上“返回会话列表”入口，返回对应列表路由。
- 图片消息缩略图在移动端不允许超出消息气泡边界。
- 聊天页移动端整体内边距收紧。

## 方案设计
### 1. 路由与视图分离
- 保持现有 list/detail 两套路由不变。
- `ChatWorkspace` 内根据 `mobileMode` 控制展示：
  - `list`：隐藏详情面板（仅桌面显示详情）。
  - `detail`：隐藏列表面板（仅桌面显示列表）。
- 在移动端 list 页面点击会话项后自动 `router.push(conversationPathPrefix + /id)`。

### 2. 详情返回交互
- `mobileMode === detail` 时，在详情头部顶部新增返回按钮。
- 按 role/path prefix 回退到 `/chat` 或 `/enterprise/chat`。

### 3. 图片与间距修正
- 图片缩略图样式改为 `w-full + max-w-full + h-auto + object-contain`，并限制最大高度，确保不越界。
- 页面根容器移动端 padding 由 `px-4 py-4` 收紧为 `px-2 py-2`。

## 风险与兼容
- 桌面端双栏结构保持不变，所有移动端行为通过 `mobileMode` 和断点类控制。
- 会话点击跳转仅在移动端触发，桌面端保留同页切换。

## 测试策略
- 扩展 `chat-workspace-redesign` 测试覆盖：
  - 用户端 list/detail 面板可见性切换。
  - 企业端 detail 返回按钮与可见性。
  - 图片缩略图边界样式与移动端容器紧凑间距。
- 回归执行：`npm run build` 与 `npm run test:run -- src/tests/pages/chat-workspace-redesign.test.tsx`。
