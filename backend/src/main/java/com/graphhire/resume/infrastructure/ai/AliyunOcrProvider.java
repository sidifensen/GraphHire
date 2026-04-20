package com.graphhire.resume.infrastructure.ai;

import cn.hutool.core.util.StrUtil;
import com.aliyun.ocr_api20210707.Client;
import com.aliyun.ocr_api20210707.models.RecognizeAllTextRequest;
import com.aliyun.ocr_api20210707.models.RecognizeAllTextResponse;
import com.aliyun.tea.TeaException;
import com.aliyun.teaopenapi.models.Config;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;

@Component
public class AliyunOcrProvider implements OcrProvider {

    private static final String PROVIDER_NAME = "aliyun";
    private static final String ENDPOINT = "ocr-api.cn-hangzhou.aliyuncs.com";

    private final OcrProperties ocrProperties;

    public AliyunOcrProvider(OcrProperties ocrProperties) {
        this.ocrProperties = ocrProperties;
    }

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    @Override
    public OcrResult recognize(OcrRequest request) {
        if (StrUtil.hasBlank(ocrProperties.getAliyun().getAccessKeyId(), ocrProperties.getAliyun().getAccessKeySecret())) {
            return OcrResult.failure("CREDENTIALS_MISSING", "Aliyun OCR credentials are missing", PROVIDER_NAME);
        }
        return doRecognize(request);
    }

    protected OcrResult doRecognize(OcrRequest request) {
        try {
            String accessKeyId = ocrProperties.getAliyun().getAccessKeyId();
            String accessKeySecret = ocrProperties.getAliyun().getAccessKeySecret();

            Config config = new Config()
                    .setAccessKeyId(accessKeyId)
                    .setAccessKeySecret(accessKeySecret)
                    .setEndpoint(ENDPOINT)
                    .setRegionId("cn-hangzhou");

            Client client = new Client(config);

            RecognizeAllTextRequest req = new RecognizeAllTextRequest()
                    .setUrl("")
                    .setBody(new ByteArrayInputStream(request.getFileBytes()))
                    .setType("General")
                    .setOutputFigure(false)
                    .setOutputQrcode(false)
                    .setOutputBarCode(false)
                    .setOutputStamp(false)
                    .setOutputCoordinate("points");

            RecognizeAllTextResponse response = client.recognizeAllText(req);

            String content = response.getBody().getData().getContent();
            if (StrUtil.isBlank(content)) {
                return OcrResult.failure("EMPTY_RESULT", "OCR returned empty text", PROVIDER_NAME);
            }

            return OcrResult.success(content, PROVIDER_NAME);

        } catch (TeaException e) {
            return OcrResult.failure(e.getCode(), e.getMessage(), PROVIDER_NAME);
        } catch (Exception e) {
            return OcrResult.failure("NETWORK_ERROR", "Network error: " + e.getMessage(), PROVIDER_NAME);
        }
    }
}
