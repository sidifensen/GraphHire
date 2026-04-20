package com.graphhire.resume.infrastructure.ai;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FallbackDocumentTextExtractorTest {

    @Mock
    private FileContentLoader fileContentLoader;
    @Mock
    private TikaTextExtractor tikaTextExtractor;
    @Mock
    private OcrService ocrService;

    @Test
    void shouldReturnTikaTextWhenTikaTextIsEnough() {
        OcrProperties properties = new OcrProperties();
        properties.setEnabled(true);
        properties.setFallbackMinTextLength(10);
        when(fileContentLoader.load("/tmp/resume.pdf")).thenReturn(new byte[]{1, 2});
        when(tikaTextExtractor.extract(any(), any())).thenReturn("这是足够长的简历文本");

        FallbackDocumentTextExtractor extractor = new FallbackDocumentTextExtractor(fileContentLoader, tikaTextExtractor, ocrService, properties);

        String result = extractor.extractText("/tmp/resume.pdf");

        assertEquals("这是足够长的简历文本", result);
        verify(ocrService, never()).recognize(any());
    }

    @Test
    void shouldCallOcrWhenTikaTextTooShort() {
        OcrProperties properties = new OcrProperties();
        properties.setEnabled(true);
        properties.setFallbackMinTextLength(10);
        when(fileContentLoader.load("/tmp/resume.pdf")).thenReturn(new byte[]{1, 2});
        when(tikaTextExtractor.extract(any(), any())).thenReturn("短");
        when(ocrService.recognize(any())).thenReturn(OcrResult.success("OCR识别结果", "tencent"));

        FallbackDocumentTextExtractor extractor = new FallbackDocumentTextExtractor(fileContentLoader, tikaTextExtractor, ocrService, properties);

        String result = extractor.extractText("/tmp/resume.pdf");

        assertEquals("OCR识别结果", result);
        verify(ocrService, times(1)).recognize(any());
    }

    @Test
    void shouldNotCallOcrWhenOcrDisabled() {
        OcrProperties properties = new OcrProperties();
        properties.setEnabled(false);
        properties.setFallbackMinTextLength(10);
        when(fileContentLoader.load("/tmp/resume.pdf")).thenReturn(new byte[]{1, 2});
        when(tikaTextExtractor.extract(any(), any())).thenReturn("短文本");

        FallbackDocumentTextExtractor extractor = new FallbackDocumentTextExtractor(fileContentLoader, tikaTextExtractor, ocrService, properties);

        String result = extractor.extractText("/tmp/resume.pdf");

        assertEquals("短文本", result);
        verify(ocrService, never()).recognize(any());
    }

    @Test
    void shouldFallbackToTikaWhenOcrFails() {
        OcrProperties properties = new OcrProperties();
        properties.setEnabled(true);
        properties.setFallbackMinTextLength(10);
        when(fileContentLoader.load("/tmp/resume.pdf")).thenReturn(new byte[]{1, 2});
        when(tikaTextExtractor.extract(any(), any())).thenReturn("短");
        when(ocrService.recognize(any())).thenReturn(OcrResult.failure("OCR_ERROR", "boom", "tencent"));

        FallbackDocumentTextExtractor extractor = new FallbackDocumentTextExtractor(fileContentLoader, tikaTextExtractor, ocrService, properties);

        String result = extractor.extractText("/tmp/resume.pdf");

        assertEquals("短", result);
    }
}
