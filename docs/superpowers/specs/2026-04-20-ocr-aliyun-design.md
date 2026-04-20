# OCR 兜底能力接入 — 阿里云方案

**日期**: 2026-04-20
**状态**: 已批准
**负责人**: Claude

---

## 1. 目标

当 Tika 提取 PDF/图片简历文本失败（文本长度 < 20），触发阿里云 OCR 兜底，提取扫描件/图片型简历文字。

---

## 2. 方案选择

**阿里云 OCR** — 项目已配置阿里云 accessKeyId/accessKeySecret，只缺 HTTP API 集成。相比腾讯云方案：API 更简洁（只需要 AK/SK，无需复杂签名），Hutool 原生支持。

---

## 3. 架构

```
FallbackDocumentTextExtractor.extractText()
  ├─ Tika 提取文本
  ├─ 文本长度 >= 20 ? → 返回 Tika 结果
  └─ 文本长度 < 20 且 OCR enabled ?
      └─ AliyunOcrProvider.recognize()
          └─ 调用阿里云 OCR API (通用文字识别)
```

**OcrProvider 接口**（已存在）：
```java
public interface OcrProvider {
    String getProviderName();
    OcrResult recognize(OcrRequest request);
}
```

---

## 4. API 设计

| 项目 | 值 |
|------|---|
| **Endpoint** | `https://ocr-api.cn-hangzhou.aliyuncs.com` |
| **Action** | `RecognizeText` |
| **Version** | `2019-12-30` |
| **认证** | AccessKeyId + AccessKeySecret + HMAC-SHA1 |

**请求体**（JSON）：
```json
{
  "ImageURL": "",
  "ImageBase64": "<base64编码图片>",
  "Configure": {
    "Language": "ZH"
  }
}
```

**响应解析**：
```json
{
  "Data": {
    "Text": "识别出的文字内容"
  },
  "Code": 0,
  "Message": "success"
}
```

---

## 5. 核心实现

### AliyunOcrProvider.doRecognize()

1. **编码图片** — 将 `request.getFileBytes()` Base64 编码
2. **构造请求** — POST JSON，含 ImageBase64 + Configure
3. **签名请求** — 使用 Hutool HMAC-SHA1，对 URL + Body 计算签名
4. **发送请求** — 使用 Hutool `HttpRequest`
5. **解析响应** — 提取 `Data.Text` 字段

### 签名算法（阿里云 RPC 风格）

```
StringToSign = HTTP_METHOD + "\n" + Content-Type + "\n" + MD5(Body) + "\n" + Date
Authorization = "acs " + AccessKeyId + ":" + Base64(HMAC-SHA1(SecretKey, StringToSign))
```

---

## 6. 错误处理

| 错误场景 | 返回 |
|----------|------|
| AK/SK 未配置 | `CREDENTIALS_MISSING` |
| 网络错误 | `NETWORK_ERROR` |
| API 返回非 200 | 解析阿里云 errorCode |
| 识别结果为空 | 返回原始 Tika 文本 |

---

## 7. 配置项

**application.yml**（已存在）：
```yaml
ai.parser.ocr:
  enabled: true
  provider: aliyun
  fallback-min-text-length: 20
  aliyun:
    accessKeyId: ${ALIYUN_ACCESS_KEY_ID:}
    accessKeySecret: ${ALIYUN_ACCESS_KEY_SECRET:}
    endpoint: ocr-api.cn-hangzhou.aliyuncs.com
```

---

## 8. 测试策略

- **单元测试**：Mock `HttpRequest` 响应，验证 Base64 编码 + JSON 解析逻辑
- **集成测试**：使用真实 PDF/图片，调用阿里云 OCR 验证

---

## 9. 文件变更

| 文件 | 变更 |
|------|------|
| `AliyunOcrProvider.java` | 实现 `doRecognize()` + 签名逻辑 |
| `AliyunOcrProviderTest.java` | 新增单元测试 |
| `application.yml` | 无变更（配置已就绪） |
