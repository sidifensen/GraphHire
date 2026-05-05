# 移动端聊天外层留白与固定布局优化验收标准

## 功能验收
1. 用户端与企业端移动端聊天列表页外层页面内边距为 0。
2. 用户端与企业端移动端聊天详情页外层页面内边距为 0。
3. 用户端与企业端移动端聊天列表卡片外层容器为直角（非圆角）。
4. 用户端与企业端移动端聊天详情外层容器为直角（非圆角）。
5. 聊天详情页顶部信息区域固定在上方，不随消息滚动。
6. 聊天详情页底部输入区域固定在下方，不随消息滚动。
7. 仅中间消息列表区域允许纵向滚动。

## 自动化验收
- `chat-workspace-redesign` 新增断言通过：
  - `chat-workspace` 含 `px-0 py-0`
  - 面板容器含 `rounded-none`
  - 详情容器含 `h-[100dvh] overflow-hidden`
  - `chat-detail-header` 与 `chat-detail-composer` 含 `shrink-0`
  - `chat-message-scroll-container` 含 `flex-1 overflow-y-auto`
