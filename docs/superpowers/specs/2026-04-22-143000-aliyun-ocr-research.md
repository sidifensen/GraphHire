# 阿里云OCR简历解析方案调研报告

## 文档信息

- **日期**：2026-04-22
- **作者**：架构师
- **任务**：调研阿里云OCR文档并设计简历解析方案

---

## 一、API概述

### 1.1 服务地址

- **区域**：华东1（杭州）
- **端点**：`ocr-api.cn-hangzhou.aliyuncs.com`
- **服务**：OCR统一识别（RecognizeAllText）

### 1.2 核心能力

OCR统一识别接口支持识别多种图片类型，包括通用文字、个人卡证、发票等。**只需通过Type参数指定图片类型，无须更换接口**。

### 1.3 使用前提

1. 开通OCR统一识别服务
2. 购买OCR共享资源包（或按量付费）
3. 使用子账号需授权：`AliyunOCRFullAccess`

---

## 二、API调用方式

### 2.1 请求端点

```
POST https://ocr-api.cn-hangzhou.aliyuncs.com/
```

### 2.2 请求方式

| 参数 | 说明 |
|------|------|
| `Url` | 图片URL（二选一，与body互斥） |
| `body` | 图片二进制文件（二选一，与Url互斥） |
| `Type` | **必选**，图片类型，如`General`、`Advanced`、`HandWriting`等 |

### 2.3 图片格式支持

- **格式**：PNG、JPG、JPEG、BMP、GIF、TIFF、WebP、PDF
- **尺寸**：大于15像素，小于8192像素，长宽比小于50
- **建议**：长宽均大于500px效果更好
- **大小**：二进制不超过10MB，建议小于1.5MB

---

## 三、请求参数详解

### 3.1 核心参数

| 参数 | 类型 | 必选 | 说明 |
|------|------|------|------|
| `Url` | string | 否 | 图片URL，与body二选一 |
| `body` | binary | 否 | 图片二进制，与Url二选一 |
| `Type` | string | **是** | 图片类型，枚举值见下表 |

### 3.2 Type枚举值（与简历相关）

| Type值 | 说明 | 适用场景 |
|--------|------|----------|
| `General` | 通用文字识别基础版 | 通用文档 |
| `Advanced` | 通用文字识别高精版 | **推荐简历使用** |
| `HandWriting` | 手写文字识别 | 手写简历 |
| `Table` | 表格识别 | 表格型简历 |

### 3.3 可选高级参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `OutputFigure` | boolean | 是否需要图案检测功能 |
| `OutputQrcode` | boolean | 是否需要二维码检测功能 |
| `OutputBarCode` | boolean | 是否需要条形码检测功能 |
| `OutputStamp` | boolean | 是否需要印章检测功能 |
| `OutputCoordinate` | string | 返回坐标格式（points/rectangle） |
| `OutputOricoord` | boolean | 是否返回原图坐标 |
| `OutputKVExcel` | boolean | 是否转成Excel |
| `OutputTable` | boolean | 是否输出表格识别结果 |
| `OutputTableExcel` | boolean | 是否导出表格Excel |
| `OutputParagraph` | boolean | 是否需要分段功能 |
| `AdvancedConfig` | object | 高精版专有配置 |

---

## 四、响应格式

### 4.1 成功响应

```json
{
  "RequestId": "E2A98925-DC2C-18FB-995F-BAF507XXXXXX",
  "Data": {
    "content": "识别出的文本内容..."
  }
}
```

### 4.2 错误响应

```json
{
  "RequestId": "...",
  "Code": "400",
  "Message": "illegalImageUrl"
}
```

---

## 五、Java SDK代码示例

### 5.1 Maven依赖

```xml
<dependency>
    <groupId>com.aliyun</groupId>
    <artifactId>ocr-api20210707</artifactId>
    <version>1.0.2</version>
</dependency>
```

### 5.2 标准调用代码

```java
import com.aliyun.ocr_api20210707.Client;
import com.aliyun.ocr_api20210707.models.RecognizeAllTextRequest;
import com.aliyun.ocr_api20210707.models.RecognizeAllTextResponse;
import com.aliyun.teaopenapi.models.Config;
import java.io.ByteArrayInputStream;

public class OcrExample {
    public static void main(String[] args) throws Exception {
        // 1. 配置认证
        Config config = new Config()
            .setAccessKeyId("您的AccessKeyId")
            .setAccessKeySecret("您的AccessKeySecret")
            .setEndpoint("ocr-api.cn-hangzhou.aliyuncs.com")
            .setRegionId("cn-hangzhou");

        // 2. 创建客户端
        Client client = new Client(config);

        // 3. 构建请求（通用高精版）
        RecognizeAllTextRequest request = new RecognizeAllTextRequest()
            .setBody(new ByteArrayInputStream(fileBytes))  // 图片二进制
            .setType("Advanced");  // 通用文字识别高精版

        // 4. 调用并获取响应
        RecognizeAllTextResponse response = client.recognizeAllText(request);

        // 5. 获取结果
        String content = response.getBody().getData().getContent();
        System.out.println("识别结果：" + content);
    }
}
```

### 5.3 按Type返回的KV字段

**简历解析重点关注**：

- `General`/`Advanced`：返回纯文本content
- `HandWriting`：手写文字识别
- `Table`：表格结构化输出

---

## 六、当前项目集成现状分析

### 6.1 现有实现

本项目已有完整的OCR集成架构：

| 文件 | 说明 |
|------|------|
| `OcrProvider.java` | OCR提供者接口 |
| `AliyunOcrProvider.java` | 阿里云OCR实现 |
| `OcrProperties.java` | 配置属性类 |
| `OcrRequest.java` | 请求对象 |
| `OcrResult.java` | 响应对象 |
| `DefaultOcrService.java` | OCR服务 |

### 6.2 当前实现的问题

1. **Type固定为"General"**：当前代码中硬编码为`General`，建议改为`Advanced`提升精度
2. **缺少进度回调**：OCR是耗时操作，需要支持进度回调机制
3. **缺少分页支持**：对于长文档，没有分页处理

### 6.3 现有配置

```yaml
ai:
  parser:
    ocr:
      enabled: true
      provider: aliyun
      fallback-min-text-length: 20
      aliyun:
        access-key-id: ${ALIYUN_ACCESS_KEY_ID:}
        access-key-secret: ${ALIYUN_ACCESS_KEY_SECRET:}
        endpoint: ocr-api.cn-hangzhou.aliyuncs.com
```

---

## 七、本项目集成方案

### 7.1 推荐Type选择

| 场景 | 推荐Type | 说明 |
|------|----------|------|
| 标准简历（印刷） | `Advanced` | 通用文字识别高精版，精度最高 |
| 手写简历 | `HandWriting` | 手写文字识别 |
| 表格型简历 | `Table` | 表格识别，保留结构 |
| 混合型 | `General` | 通用基础版，兼容性最好 |

### 7.2 架构改进建议

```
简历上传 → 文件存储 → OCR识别 → 文本提取 → AI解析 → 结构化数据
                            ↓
                       进度回调（WebSocket/SSE）
```

### 7.3 关键改进点

1. **Type动态选择**：根据文件特征动态选择Type
2. **进度回调机制**：实现简历解析进度实时推送
3. **多Type联合识别**：对复杂简历尝试多种Type取最优
4. **错误重试机制**：失败时自动切换Type重试

### 7.4 进度追踪设计

```java
// 简历解析进度状态
enum ParseProgress {
    UPLOADING,      // 上传中
    FILE_STORED,    // 文件已存储
    OCR_STARTED,    // OCR开始识别
    OCR_COMPLETED,  // OCR识别完成
    PARSING,        // 解析中
    COMPLETED,      // 完成
    FAILED          // 失败
}
```

### 7.5 前端进度对接方案

1. **后端**：OCR识别进度通过WebSocket/SSE推送
2. **前端**：实时显示解析进度百分比
3. **状态存储**：Redis缓存解析进度

---

## 八、结论与建议

### 8.1 技术可行

阿里云OCR `RecognizeAllText`接口完全满足简历解析需求，支持：
- 多种文档格式（PDF、图片）
- 高精度文字识别
- 手写文字识别
- 表格结构化输出

### 8.2 改进优先级

1. **P0**：将Type从"General"改为"Advanced"
2. **P0**：实现进度回调机制（后端→前端）
3. **P1**：增加OCR重试和Type切换逻辑
4. **P2**：支持多Type联合识别取最优结果

### 8.3 配置建议

```yaml
ai:
  parser:
    ocr:
      aliyun:
        default-type: "Advanced"  # 改为高精版
        fallback-types:
          - "General"
          - "HandWriting"
        timeout: 30000  # 30秒超时
```