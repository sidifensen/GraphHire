# 聊天页暗色可读性修复设计

## 背景
用户反馈聊天页在夜间模式下存在多处浅色硬编码，导致局部区域刺眼或可读性差。问题主要集中在：
- 左侧会话搜索输入
- 底部右侧表情/图片按钮
- 文本输入框
- 右侧消息区滚动条
- 对方消息气泡与文本容器

## 目标
在不改变现有聊天业务逻辑的前提下，将上述区域统一替换为主题 token 样式，使其在亮色/暗色下都可读且对比稳定。

## 约束
- 不改动接口与数据结构
- 不改动消息发送/上传/预览逻辑
- 样式层禁止继续使用目标元素上的 `bg-white` / `border-white` 硬编码
- 可滚动区域必须提供主题化滚动条

## 方案
1. 在聊天组件中，将问题元素的背景/边框/ring 统一替换为 `surface`/`outline` token 类名。
2. 为消息滚动区与会话列表滚动区追加统一类 `chat-scrollbar`。
3. 在 `globals.css` 新增 `chat-scrollbar` 的 Firefox + WebKit 双实现，颜色使用主题变量：
   - track: `--color-surface-container-low`
   - thumb: `--color-surface-container-highest`
   - thumb hover: `--color-outline`
4. 对消息流中的“对方气泡”和“日期分隔胶囊”改为 token 风格，去除白底依赖。

## 测试策略
- 先更新 `chat-workspace-redesign.test.tsx`：新增暗色可读性断言，要求目标元素包含主题类且不包含 `bg-white`。
- 执行 RED：先跑该测试文件，确认新增断言在改样式前失败。
- 完成样式修改后执行 GREEN：重跑测试文件通过。
- 最后按仓库规范执行前端全量验证：`npm run test:run` + `npm run build`。
