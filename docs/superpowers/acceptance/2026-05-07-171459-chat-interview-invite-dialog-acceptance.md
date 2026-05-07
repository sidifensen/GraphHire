# 聊天面试通知弹窗组件化验收标准

- [ ] 企业端聊天输入区存在“面试通知”按钮，点击后打开弹窗。
- [ ] 弹窗内包含面试时间、面试地点、面试备注字段。
- [ ] 点击面试时间字段可打开时间选择层（日期+时间）。
- [ ] 输入区不再渲染内联面试通知表单与内联“确认发送面试通知”按钮。
- [ ] 点击弹窗确认发送后调用 `chatApi.sendInterviewInvite`，并传递 `interviewTime/location/remark`。
- [ ] `interviewTime` 以 `yyyy-MM-ddTHH:mm:ss` 字符串格式提交。
- [ ] 发送成功后关闭弹窗并刷新消息。
- [ ] 发送失败时展示错误且保留弹窗内容。
- [ ] 改造后前端 `npm run build` 与 `npm run test:run` 通过。
