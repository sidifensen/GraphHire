# Acceptance Criteria: OCR Provider Abstraction

**Spec:** `docs/superpowers/specs/2026-04-20-ocr-provider-abstraction-design.md`
**Date:** 2026-04-20
**Status:** Approved

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | `DocumentParser` 保留为兼容门面，并将 `extractText(String filePath)` 委托给新的文本提取编排入口。 | Logic | 阅读后端文档解析相关实现与设计对应的类关系。 | `DocumentParser` 仍存在且公开 `extractText(String filePath)`；其实现不再直接内嵌完整 Tika+OCR 编排，而是委托 `DocumentTextExtractor`。 |
| AC-002 | 新增统一文本提取抽象与默认回退编排组件。 | Logic | 阅读新增类与依赖注入配置。 | 代码中存在 `DocumentTextExtractor`、`FallbackDocumentTextExtractor`、`TikaTextExtractor`、`FileContentLoader`；默认文本提取路径由 `FallbackDocumentTextExtractor` 负责串联。 |
| AC-003 | 新增统一 OCR 服务抽象与默认实现。 | Logic | 阅读 OCR 相关服务定义。 | 代码中存在 `OcrService` 与 `DefaultOcrService`；业务编排层只依赖 `OcrService`，不直接依赖具体云厂商实现。 |
| AC-004 | 新增统一 OCR provider 抽象，并支持腾讯云和阿里云两个 provider。 | Logic | 阅读 OCR provider 定义与实现。 | 代码中存在 `OcrProvider`、`TencentOcrProvider`、`AliyunOcrProvider`；`DefaultOcrService` 可根据 provider 标识路由到对应实现。 |
| AC-005 | OCR 请求与响应使用统一模型封装。 | Logic | 阅读 OCR 模型类定义。 | 代码中存在 `OcrRequest` 与 `OcrResult`；provider 与 service 之间不直接暴露厂商专属请求/响应模型。 |
| AC-006 | 配置项包含 OCR 总开关、默认 provider、最小回退文本长度，以及腾讯云/阿里云凭证区。 | Logic | 检查配置类与配置示例。 | 配置中可找到 `app.parser.ocr.enabled`、`app.parser.ocr.provider`、`app.parser.ocr.fallback-min-text-length`、`app.parser.ocr.providers.tencent`、`app.parser.ocr.providers.aliyun`；缺少这些键时测试视为失败。 |
| AC-007 | Tika 主路径提取到足够文本时不得调用云 OCR。 | Logic | 单元测试中模拟 `TikaTextExtractor` 返回长度大于等于阈值的文本，OCR 开关为开启。 | 测试断言最终返回 Tika 文本，且 `OcrService.recognize` 调用次数为 0。 |
| AC-008 | Tika 失败或文本为空/过短时，开启 OCR 后会调用云 OCR 并在成功时返回 OCR 文本。 | Logic | 单元测试中模拟 Tika 抛异常或返回空/短文本，OCR 开关开启，provider 返回成功的 `OcrResult`。 | 测试断言 `OcrService.recognize` 调用次数为 1，最终返回值等于 `OcrResult.text`。 |
| AC-009 | 当 Tika 与 OCR 都未得到有效文本时，消费者必须按失败处理且不得继续调用 AI 解析。 | Logic | `ResumeParseMQConsumer` 或 `JobParseMQConsumer` 测试中模拟 `DocumentParser.extractText` 返回空白文本。 | 对应实体状态被更新为 `FAILED`，错误信息包含“空文本”或“未提取到有效文本”，且 `deepSeekClient.parseResume` / `deepSeekClient.parseJob` 调用次数为 0。 |
| AC-010 | 简历解析消费者具备空文本失败保护。 | Logic | 在 `ResumeParseMQConsumer` 单元测试中模拟 `DocumentParser.extractText` 返回空白文本。 | `Resume` 的 `status` 为 `FAILED`，`ParseTask` 的 `status` 为 `FAILED`，并且不会创建成功通知，也不会发送后续成功事件。 |
| AC-011 | 职位解析消费者具备空文本失败保护。 | Logic | 在 `JobParseMQConsumer` 单元测试中模拟 `DocumentParser.extractText` 返回空白文本。 | `Job.parseStatus` 为 `FAILED`，`ParseTask.status` 为 `FAILED`，且 `deepSeekClient.parseJob` 调用次数为 0。 |
| AC-012 | 配置关闭 OCR 时，即使 Tika 文本为空或过短也不得触发云 OCR。 | Logic | 单元测试中设置 `app.parser.ocr.enabled=false`，并让 Tika 返回空或短文本。 | 测试断言 `OcrService.recognize` 调用次数为 0，最终返回值等于 Tika 原结果（空串或短文本）。 |
| AC-013 | 默认 OCR 服务能按配置选择腾讯云或阿里云 provider。 | Logic | 单元测试分别设置 `provider=tencent` 与 `provider=aliyun`，并注入两个 provider mock。 | 配置为 `tencent` 时仅 `TencentOcrProvider` 被调用一次；配置为 `aliyun` 时仅 `AliyunOcrProvider` 被调用一次。 |
| AC-014 | Provider 凭证缺失时必须产生可判定失败结果。 | Logic | 单元测试中模拟选中的 provider 凭证为空。 | 测试断言返回的 `OcrResult.success=false` 或抛出明确异常，且错误码或错误信息包含凭证缺失字段。 |
| AC-015 | 实现新增或修改的工具性逻辑优先复用 Hutool 能力而非重复造轮子。 | Logic | 代码评审实现中的文本判空、长度判断、文件存在判断等工具逻辑。 | 文本判空、长度处理、文件存在判断、字节读取优先使用 Hutool 现有能力，且仓库中未新增与这些能力重复的自定义工具类。 |
