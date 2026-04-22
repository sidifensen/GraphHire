package com.graphhire.resume.infrastructure.ai;

import cn.hutool.core.util.StrUtil;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DefaultOcrService implements OcrService {

    private final OcrProperties ocrProperties;
    private final List<OcrProvider> providers;

    public DefaultOcrService(OcrProperties ocrProperties, List<OcrProvider> providers) {
        this.ocrProperties = ocrProperties;
        this.providers = providers;
    }

    @Override
    public OcrResult recognize(OcrRequest request) {
        if (!ocrProperties.isEnabled()) {
            return OcrResult.failure("OCR_DISABLED", "OCR is disabled by configuration", "none");
        }
        return providers.stream()
                .filter(provider -> StrUtil.equalsIgnoreCase(provider.getProviderName(), ocrProperties.getProvider()))
                .findFirst()
                .map(provider -> provider.recognize(request))
                .orElseGet(() -> OcrResult.failure("PROVIDER_NOT_FOUND", "No OCR provider found for " + ocrProperties.getProvider(), ocrProperties.getProvider()));
    }
}
