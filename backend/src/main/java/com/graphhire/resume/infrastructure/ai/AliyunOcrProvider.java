package com.graphhire.resume.infrastructure.ai;

import cn.hutool.core.util.StrUtil;
import org.springframework.stereotype.Component;

@Component
public class AliyunOcrProvider implements OcrProvider {

    private static final String PROVIDER_NAME = "aliyun";

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
        return OcrResult.failure("NOT_IMPLEMENTED", "Aliyun OCR SDK integration is not implemented yet", PROVIDER_NAME);
    }
}
