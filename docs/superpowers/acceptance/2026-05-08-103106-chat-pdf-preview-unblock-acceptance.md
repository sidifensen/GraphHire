# 聊天沟通页 PDF 预览修复验收标准

- [ ] 在聊天消息流点击“预览PDF”后，预览弹窗正常出现。
- [ ] 弹窗中 PDF 使用 `object[type="application/pdf"]` 渲染，不再依赖 `iframe sandbox`。
- [ ] 当浏览器无法内嵌显示 PDF 时，弹窗内提供“下载PDF文件”回退入口。
- [ ] “下载PDF”按钮行为保持可用（仍触发下载文件流程）。
- [ ] 相关前端自动化测试通过，覆盖预览弹窗渲染结构与下载行为。
- [ ] `npm run test:run` 通过。
- [ ] `npm run build` 通过。