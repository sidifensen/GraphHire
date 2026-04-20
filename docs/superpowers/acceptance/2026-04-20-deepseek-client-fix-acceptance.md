# DeepSeek 客户端修复验收标准

- [ ] `generateMatchReason` 调用 DeepSeek chat/completions 时包含 `Authorization` header。
- [ ] `parseJob` 调用 DeepSeek chat/completions 时包含 `Authorization` header。
- [ ] `calculateMatch` 能从 `choices[0].message.content` 中解析 JSON，并映射出匹配结果。
- [ ] `parseResume` / `parseJob` 支持解析 ```json fenced block 中的 JSON。
- [ ] 非 2xx、空响应、content 为空、JSON 解析失败时会进入 fallback，且日志可区分 AI 成功与 fallback。
- [ ] 新增后端单元测试覆盖上述关键路径并通过。
