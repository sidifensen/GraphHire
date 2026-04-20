# DeepSeek 客户端修复设计

**日期：** 2026-04-20  
**范围：** 仅限后端 `DeepSeekClient` 与直接相关单元测试。

## 背景

当前 DeepSeek 集成存在四类确定问题：
1. `generateMatchReason` 与 `parseJob` 缺少 `Authorization` header；
2. `calculateMatch` 与 `parseJob`/`parseResume` 对 chat completion 响应解析不一致，部分路径错误地直接解析 HTTP 顶层 JSON，而不是先取 `choices[0].message.content`；
3. 请求失败、非 2xx、空响应、内容解析失败时日志不足，难以区分真实 AI 成功与 fallback；
4. 解析 JSON 时对 ```json fenced block 缺乏兼容。

## 设计

### 1. 统一调用入口
在 `DeepSeekClient` 内新增统一 chat/completions 调用封装，负责：
- 注入 `Authorization: Bearer <apiKey>` 与 `Content-Type`；
- 检查 HTTP status；
- 解析顶层响应并提取 `choices[0].message.content`；
- 在非 2xx、空 body、空 content、结构异常时记录明确日志；
- 不记录完整密钥。

### 2. 统一内容解析
- `generateMatchReason`：直接消费抽出的 content；失败则返回现有默认文案，并记录 fallback 日志。
- `calculateMatch`：先解析 content，再把 content 当 JSON 解析；若 content 解析失败，则 warning 后走本地 fallback。
- `parseResume` / `parseJob`：复用统一调用，支持 fenced JSON 去壳后再解析；失败时保留现有 mock/fallback。

### 3. 可观测性
新增分类日志：
- AI 调用成功；
- HTTP 非 2xx；
- body/content 为空；
- content JSON 解析失败；
- fallback 被触发。

### 4. 测试策略
新增 `DeepSeekClientTest`，覆盖：
- 授权头已携带；
- 能从 `choices[0].message.content` 解析 JSON；
- 非 2xx、空响应会 fallback；
- `parseJob` 不再因缺失 header 走错误路径；
- fenced JSON 仍可解析。
