package com.graphhire.resume.infrastructure.ai;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class FallbackDocumentTextExtractor implements DocumentTextExtractor {

    private static final Logger log = LoggerFactory.getLogger(FallbackDocumentTextExtractor.class);

    private final FileContentLoader fileContentLoader;
    private final TikaTextExtractor tikaTextExtractor;
    private final OcrService ocrService;
    private final OcrProperties ocrProperties;

    public FallbackDocumentTextExtractor(FileContentLoader fileContentLoader,
                                         TikaTextExtractor tikaTextExtractor,
                                         OcrService ocrService,
                                         OcrProperties ocrProperties) {
        this.fileContentLoader = fileContentLoader;
        this.tikaTextExtractor = tikaTextExtractor;
        this.ocrService = ocrService;
        this.ocrProperties = ocrProperties;
    }

    @Override
    public String extractText(String filePath) {
        byte[] bytes = fileContentLoader.load(filePath);
        String tikaText = tikaTextExtractor.extract(bytes, filePath);
        if (isEnoughText(tikaText)) {
            return tikaText;
        }
        // Tika文本不足，使用OCR补充
        if (ocrProperties.isEnabled()) {
            log.info("Tika extracted insufficient text ({} chars), using OCR fallback", tikaText.length());
            OcrRequest ocrRequest = new OcrRequest(bytes, filePath, "application/octet-stream", filePath);
            OcrResult ocrResult = ocrService.recognize(ocrRequest);
            if (ocrResult.isSuccess()) {
                String ocrText = ocrResult.getText();
                if (StrUtil.isNotBlank(ocrText)) {
                    log.info("OCR fallback succeeded, extracted {} chars", ocrText.length());
                    // 合并Tika和OCR结果
                    return tikaText + "\n" + ocrText;
                }
            } else {
                log.warn("OCR fallback failed: {}", ocrResult.getErrorCode());
            }
        }
        return tikaText;
    }

    private boolean isEnoughText(String text) {
        return StrUtil.length(StrUtil.trim(text)) >= ocrProperties.getFallbackMinTextLength();
    }
}
