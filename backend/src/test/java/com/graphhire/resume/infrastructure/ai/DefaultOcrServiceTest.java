package com.graphhire.resume.infrastructure.ai;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DefaultOcrServiceTest {

    @Mock
    private OcrProvider tencentProvider;
    @Mock
    private OcrProvider aliyunProvider;

    @Test
    void shouldRouteToConfiguredProvider() {
        OcrProperties properties = new OcrProperties();
        properties.setEnabled(true);
        properties.setProvider("tencent");
        when(tencentProvider.getProviderName()).thenReturn("tencent");
        OcrRequest request = new OcrRequest(new byte[]{1}, "resume.pdf", "application/pdf", "/tmp/resume.pdf");
        when(tencentProvider.recognize(request)).thenReturn(OcrResult.success("ocr-text", "tencent"));

        DefaultOcrService service = new DefaultOcrService(properties, java.util.List.of(tencentProvider, aliyunProvider));

        OcrResult result = service.recognize(request);

        assertTrue(result.isSuccess());
        assertEquals("ocr-text", result.getText());
        verify(tencentProvider).recognize(request);
        verify(aliyunProvider, never()).recognize(any());
    }

    @Test
    void shouldReturnFailureWhenProviderMissing() {
        OcrProperties properties = new OcrProperties();
        properties.setEnabled(true);
        properties.setProvider("missing");
        when(tencentProvider.getProviderName()).thenReturn("tencent");

        DefaultOcrService service = new DefaultOcrService(properties, java.util.List.of(tencentProvider));

        OcrResult result = service.recognize(new OcrRequest(new byte[]{1}, "resume.pdf", "application/pdf", "/tmp/resume.pdf"));

        assertFalse(result.isSuccess());
        assertEquals("PROVIDER_NOT_FOUND", result.getErrorCode());
    }
}
