package com.graphhire.resume.infrastructure.ai;

import cn.hutool.core.util.StrUtil;
import org.springframework.stereotype.Component;

@Component
public class TencentOcrProvider implements OcrProvider {

    private static final String PROVIDER_NAME = "tencent";

    private final OcrProperties ocrProperties;

    public TencentOcrProvider(OcrProperties ocrProperties) {
        this.ocrProperties = ocrProperties;
    }

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    @Override
    public OcrResult recognize(OcrRequest request) {
        if (StrUtil.hasBlank(ocrProperties.getTencent().getSecretId(), ocrProperties.getTencent().getSecretKey())) {
            return OcrResult.failure("CREDENTIALS_MISSING", "Tencent OCR credentials are missing", PROVIDER_NAME);
        }
        return doRecognize(request);
    }

    protected OcrResult doRecognize(OcrRequest request) {
        return OcrResult.failure("NOT_IMPLEMENTED", "Tencent OCR SDK integration is not implemented yet", PROVIDER_NAME);
    }
}
