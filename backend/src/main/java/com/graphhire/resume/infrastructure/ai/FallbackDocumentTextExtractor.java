package com.graphhire.resume.infrastructure.ai;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import org.springframework.stereotype.Component;

@Component
public class FallbackDocumentTextExtractor implements DocumentTextExtractor {

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
        if (!ocrProperties.isEnabled()) {
            return tikaText;
        }
        OcrRequest request = new OcrRequest(bytes, FileUtil.getName(filePath), FileUtil.getMimeType(filePath), filePath);
        OcrResult result = ocrService.recognize(request);
        if (result.isSuccess() && StrUtil.isNotBlank(result.getText())) {
            return result.getText();
        }
        return tikaText;
    }

    private boolean isEnoughText(String text) {
        return StrUtil.length(StrUtil.trim(text)) >= ocrProperties.getFallbackMinTextLength();
    }
}
