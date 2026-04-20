# OCR Provider Abstraction 设计规格

**日期：** 2026-04-20  
**范围：** 仅限后端文档文本提取与 OCR 回退链路的设计说明，不包含本次代码实现。  
**关联验收：** `docs/superpowers/acceptance/2026-04-20-ocr-provider-abstraction-acceptance.md`

## 1. 目标

本设计用于为简历与职位文档解析链路引入统一的文本提取与 OCR 回退抽象，满足以下目标：

1. 保留现有 `DocumentParser` 作为兼容门面，避免直接调用方在本轮改造中大面积重写。
2. 将“文件加载”“Tika 文本提取”“云 OCR fallback”“回退判定”拆分为职责单一的组件，降低后续扩展新 OCR 服务商的成本。
3. 以 Apache Tika 作为主提取路径，在文本为空或长度过短时自动回退到云 OCR。
4. 引入统一的 `OcrProvider`、`OcrRequest`、`OcrResult` 模型，使腾讯云与阿里云 OCR 能通过同一编排入口接入。
5. 为 `ResumeParseMQConsumer` 和 `JobParseMQConsumer` 增加空文本失败保护，避免将空文本继续送入 AI 解析链路。
6. 为后续实现提供明确的配置结构、错误处理约定和测试覆盖范围。
7. 代码实现阶段优先复用 Hutool 能力处理字符串、集合、异常和文件判定，避免重复造轮子。

## 2. 非目标

以下事项不在本次设计落地范围内：

1. 不改造 `DeepSeekClient`、简历/职位结构化解析 prompt 或结果映射逻辑。
2. 不在本轮引入除腾讯云、阿里云以外的第三方 OCR 服务商。
3. 不设计前端配置页面、运维控制台或动态运行时切换页面。
4. 不覆盖图片预处理增强、版面纠偏、表格结构化识别等高级 OCR 能力。
5. 不改变 RustFS、RocketMQ、数据库表结构或消息体格式。

## 3. 现状问题

当前后端文档解析链路存在以下确定问题：

1. `DocumentParser` 同时承担文件读取、Tika 解析、兼容占位 AI 解析等多重职责，边界不清晰。
2. `DocumentParser.extractText` 当前只尝试本地文件与 `s3://` 路径后直接走 Tika，没有统一 fallback 机制。
3. Tika 对扫描件 PDF、图片型附件等场景可能返回空文本或极短文本，但当前调用链没有区分“解析成功但无有效文本”和“可继续走 OCR”的状态。
4. `ResumeParseMQConsumer` 与 `JobParseMQConsumer` 在拿到空文本后仍可能继续调用 AI 解析客户端，导致无意义请求或错误成功状态。
5. 现有代码没有抽象 OCR provider，后续若切换腾讯云/阿里云需要在业务代码中直接分叉。
6. 配置层没有统一承载 OCR 开关、默认 provider、文本长度阈值和多 provider 凭证区。

## 4. 设计概览

### 4.1 总体思路

新方案保持 `DocumentParser` 作为兼容门面，对外继续暴露 `extractText(String filePath)`；其内部不再直接绑定 Tika，而是委托新的文本提取编排链路：

`DocumentParser` → `DocumentTextExtractor` → `FallbackDocumentTextExtractor` → `FileContentLoader` + `TikaTextExtractor` + `OcrService`

其中：

- `DocumentParser`：兼容旧调用方，只负责门面转发。
- `DocumentTextExtractor`：文档文本提取统一入口接口。
- `FallbackDocumentTextExtractor`：实现主路径与回退策略编排。
- `FileContentLoader`：统一加载本地文件与 RustFS `s3://` 文件字节。
- `TikaTextExtractor`：只负责基于 Tika 从字节流提取文本。
- `OcrService` / `DefaultOcrService`：负责根据配置选择 OCR provider，并返回统一结果。
- `OcrProvider`：各云厂商 OCR 适配接口，首批实现 `TencentOcrProvider`、`AliyunOcrProvider`。

### 4.2 文本提取时序

1. `ResumeParseMQConsumer` / `JobParseMQConsumer` 继续调用 `DocumentParser.extractText(filePath)`。
2. `DocumentParser` 将请求转发给 `DocumentTextExtractor`。
3. `FallbackDocumentTextExtractor` 调用 `FileContentLoader` 读取文件字节。
4. `FallbackDocumentTextExtractor` 调用 `TikaTextExtractor` 获取主路径文本。
5. 若 Tika 返回文本非空且长度大于等于 `fallback-min-text-length`，直接返回，不触发 OCR。
6. 若 OCR 开关关闭，则直接返回 Tika 结果；若结果为空或过短，consumer 侧按空文本失败保护处理。
7. 若 OCR 开关开启且 Tika 结果为空或过短，则构造 `OcrRequest` 调用 `OcrService`。
8. `DefaultOcrService` 根据 `app.parser.ocr.provider` 选择具体 `OcrProvider`。
9. provider 返回 `OcrResult` 后，`FallbackDocumentTextExtractor` 按以下规则产出最终文本：
   - OCR 成功且文本非空：返回 OCR 文本；
   - OCR 失败或文本仍为空：返回 Tika 原结果（可能为空串），并记录失败原因。
10. consumer 在收到最终文本后，若文本为空白，则标记解析失败并写入错误信息，不再继续调用 AI 结构化解析。

## 5. 架构与组件职责

### 5.1 `DocumentParser`

- 角色：兼容门面。
- 保留原因：现有 `ParseAppService`、`ResumeParseMQConsumer`、`JobParseMQConsumer` 与相关测试已依赖该类，保留可降低改造面。
- 改造方式：内部注入 `DocumentTextExtractor`，`extractText` 只做委托。
- 兼容要求：公开方法签名保持不变，旧调用方无需在本轮修改调用参数。

### 5.2 `DocumentTextExtractor`

建议定义为统一入口接口，例如：

```java
public interface DocumentTextExtractor {
    String extractText(String filePath);
}
```

职责：
- 抽象“按路径提取文档文本”的统一能力。
- 允许后续接入更复杂策略而不影响调用方。

### 5.3 `FallbackDocumentTextExtractor`

职责：
- 作为默认实现，编排文件加载、Tika 主路径和云 OCR fallback。
- 依据配置执行“是否启用 OCR”和“是否满足最小文本长度”判断。
- 记录主路径成功、fallback 触发、fallback 失败等日志。

判定规则：
- 使用 Hutool 的 `StrUtil.isBlank`、`StrUtil.trim`、`StrUtil.length` 等能力统一文本判空与长度计算。
- 文本为空或长度小于 `app.parser.ocr.fallback-min-text-length` 时视为“需要 fallback”。

### 5.4 `FileContentLoader`

职责：
- 统一加载文件字节，屏蔽本地路径与 RustFS 路径差异。
- 对本地路径优先使用 Hutool `FileUtil.exist`、`FileUtil.readBytes`。
- 对 `s3://` 路径继续复用 `RustFSClient.download`。
- 文件不存在、读取失败、返回空字节时抛出明确异常，供上层统一处理。

### 5.5 `TikaTextExtractor`

职责：
- 只做字节流到纯文本的 Tika 提取。
- 不关心文件来源、不关心 OCR 配置、不负责 provider 选择。
- 对 Tika 抛出的异常进行包装，输出可观测错误信息。

### 5.6 `OcrService` / `DefaultOcrService`

建议接口：

```java
public interface OcrService {
    OcrResult recognize(OcrRequest request);
}
```

职责：
- 接收统一的 `OcrRequest`。
- 基于配置选择实际 provider。
- 对 provider 不存在、provider 未启用、凭证缺失等场景返回失败结果或抛出明确业务异常。

默认实现 `DefaultOcrService` 需要：
- 注入可用的 `OcrProvider` 列表或映射；
- 根据 `app.parser.ocr.provider` 定位 provider；
- 对 provider 返回值做兜底标准化，确保调用方拿到统一的 `OcrResult`。

### 5.7 `OcrProvider`

建议接口：

```java
public interface OcrProvider {
    String getProviderName();
    OcrResult recognize(OcrRequest request);
}
```

首批实现：
- `TencentOcrProvider`
- `AliyunOcrProvider`

约束：
- 统一接收 `OcrRequest`，统一返回 `OcrResult`。
- provider 实现内部可各自封装厂商 SDK/HTTP 请求，但对外不可泄露厂商专属模型到业务层。

### 5.8 `OcrRequest` / `OcrResult`

`OcrRequest` 建议包含：
- `byte[] fileBytes`
- `String fileName`
- `String contentType`
- `String sourcePath`

`OcrResult` 建议包含：
- `boolean success`
- `String text`
- `String provider`
- `String errorCode`
- `String errorMessage`

约束：
- `text` 必须为提取后的纯文本；
- `provider` 使用统一 provider 标识（如 `tencent` / `aliyun`）；
- 失败场景必须写明可判定错误码或错误消息，便于日志与测试断言。

## 6. 配置设计

新增并约定以下配置：

```yaml
app:
  parser:
    ocr:
      enabled: true
      provider: tencent
      fallback-min-text-length: 20
      providers:
        tencent:
          secret-id: ${TENCENT_OCR_SECRET_ID:}
          secret-key: ${TENCENT_OCR_SECRET_KEY:}
          region: ap-guangzhou
        aliyun:
          access-key-id: ${ALIYUN_OCR_ACCESS_KEY_ID:}
          access-key-secret: ${ALIYUN_OCR_ACCESS_KEY_SECRET:}
          endpoint: ocr-api.cn-hangzhou.aliyuncs.com
```

配置约束：

1. `app.parser.ocr.enabled`：是否允许触发云 OCR fallback。
2. `app.parser.ocr.provider`：默认使用的 provider 标识，合法值至少包括 `tencent`、`aliyun`。
3. `app.parser.ocr.fallback-min-text-length`：Tika 文本达到该阈值时视为成功，不触发 OCR。
4. `app.parser.ocr.providers.tencent`：腾讯云 OCR 所需凭证配置区。
5. `app.parser.ocr.providers.aliyun`：阿里云 OCR 所需凭证配置区。
6. 生产环境凭证必须走环境变量或密钥管理，不得在仓库中写死真实密钥。

## 7. 错误处理与回退规则

### 7.1 Tika 主路径

- 文件无法加载：直接抛出异常，由 consumer 进入失败分支。
- Tika 抛异常：记录日志并进入 OCR fallback 判定。
- Tika 返回空串或短文本：若 OCR 开启则进入 OCR fallback；否则返回原结果。

### 7.2 云 OCR fallback

- 仅在 `enabled=true` 且 Tika 文本为空或过短时触发。
- provider 未找到、凭证缺失、云端调用失败、OCR 返回空文本时，不得伪造成功结果。
- fallback 失败后保留 Tika 原结果，并附带日志说明 fallback 已失败。

### 7.3 consumer 空文本失败保护

`ResumeParseMQConsumer` 与 `JobParseMQConsumer` 必须新增保护：

1. 调用 `DocumentParser.extractText` 后，若最终文本为空白，则直接抛出或封装“文档未提取到有效文本”的明确异常。
2. 失败后必须更新解析实体状态为 `FAILED`，并写入 `parseError` / `errorMessage`。
3. 空文本场景不得继续调用 `deepSeekClient.parseResume` 或 `deepSeekClient.parseJob`。
4. 空文本失败属于可观测业务失败，不得写成 SUCCESS + 空 JSON。

### 7.4 日志要求

至少记录以下事件：
- 文件加载来源（本地 / RustFS）；
- Tika 提取成功、失败、空文本、短文本；
- OCR fallback 是否触发；
- 使用的 provider 名称；
- OCR 成功、失败、空文本返回；
- consumer 因空文本进入失败保护。

日志中不得输出真实密钥、完整凭证或敏感文件内容。

## 8. 核心接口协作示意

```java
String DocumentParser.extractText(String filePath) {
    return documentTextExtractor.extractText(filePath);
}

String FallbackDocumentTextExtractor.extractText(String filePath) {
    byte[] bytes = fileContentLoader.load(filePath);
    String tikaText = tikaTextExtractor.extract(bytes, filePath);
    if (isEnoughText(tikaText)) {
        return tikaText;
    }
    if (!ocrEnabled) {
        return defaultString(tikaText);
    }
    OcrResult ocrResult = ocrService.recognize(buildRequest(bytes, filePath));
    return ocrResult.success() && isNotBlank(ocrResult.text())
        ? ocrResult.text()
        : defaultString(tikaText);
}
```

该协作要求体现两点：
- 旧入口不变；
- 编排、provider 选择、文件读取和文本提取解耦。

## 9. 测试策略

实现阶段至少覆盖以下测试：

1. **Tika 成功不走 OCR**：Tika 返回达到阈值的文本时，`OcrService` 不被调用。
2. **Tika 失败后 OCR 成功**：Tika 异常或返回空/短文本时，触发 OCR，最终返回 OCR 文本。
3. **Tika + OCR 都失败**：最终返回空文本或失败结果，consumer 能进入失败分支。
4. **消费者空文本失败**：`ResumeParseMQConsumer`、`JobParseMQConsumer` 在空文本场景下更新状态为失败，且不调用 DeepSeek 客户端。
5. **Provider 选择路由**：配置 `tencent` 时调用 `TencentOcrProvider`，配置 `aliyun` 时调用 `AliyunOcrProvider`。
6. **配置关闭 OCR**：`enabled=false` 时即使 Tika 文本过短也不触发 OCR。
7. **凭证缺失可观测**：provider 凭证缺失时能返回可断言错误信息或抛出明确异常。

测试层次建议：
- 单元测试：覆盖 `FallbackDocumentTextExtractor`、`DefaultOcrService`、两个 provider、两个 consumer。
- 保持现有 consumer 测试风格，使用 Mockito 验证“不调用 OCR / 不调用 DeepSeek”的分支约束。

## 10. 落地范围

本设计对应的实现落地范围限定为：

1. 在后端新增 OCR 抽象接口与默认编排实现。
2. 调整 `DocumentParser` 为兼容门面，内部委托新编排。
3. 为腾讯云与阿里云 OCR 提供首批 provider 适配实现。
4. 增加 OCR 配置对象与 `application.yml` 示例配置。
5. 更新 `ResumeParseMQConsumer`、`JobParseMQConsumer` 的空文本失败保护。
6. 补充对应单元测试。

不在本次实现中的内容包括：
- 增加更多 provider；
- 改造前端页面；
- 修改 MQ 协议；
- 增加数据库迁移。

## 11. 方案结论

本方案通过“兼容门面 + 文本提取编排 + OCR provider 抽象”的方式，把当前单体式 `DocumentParser` 拆解为可扩展组件，同时保持现有调用入口稳定。主路径继续以 Tika 为主，在文本为空或过短时才触发云 OCR，从而平衡实现复杂度、调用成本与识别成功率；consumer 侧的空文本失败保护则保证下游 AI 解析不会建立在无效输入之上。
