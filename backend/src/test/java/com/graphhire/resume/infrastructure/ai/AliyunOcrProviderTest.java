package com.graphhire.resume.infrastructure.ai;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@ExtendWith(MockitoExtension.class)
class AliyunOcrProviderTest {

    @Test
    void shouldReturnFailureWhenSecretMissing() {
        OcrProperties properties = new OcrProperties();
        properties.getAliyun().setAccessKeyId("");
        properties.getAliyun().setAccessKeySecret("secret");

        AliyunOcrProvider provider = new AliyunOcrProvider(properties);

        OcrResult result = provider.recognize(new OcrRequest(new byte[]{1}, "resume.pdf", "application/pdf", "/tmp/resume.pdf"));

        assertFalse(result.isSuccess());
        assertEquals("CREDENTIALS_MISSING", result.getErrorCode());
    }

    @Test
    void shouldReturnFailureWhenSecretKeyMissing() {
        OcrProperties properties = new OcrProperties();
        properties.getAliyun().setAccessKeyId("testId");
        properties.getAliyun().setAccessKeySecret("");

        AliyunOcrProvider provider = new AliyunOcrProvider(properties);

        OcrResult result = provider.recognize(new OcrRequest(new byte[]{1}, "resume.pdf", "application/pdf", "/tmp/resume.pdf"));

        assertFalse(result.isSuccess());
        assertEquals("CREDENTIALS_MISSING", result.getErrorCode());
    }

    @Test
    void shouldReturnFailureWhenBothSecretsMissing() {
        OcrProperties properties = new OcrProperties();
        properties.getAliyun().setAccessKeyId(null);
        properties.getAliyun().setAccessKeySecret(null);

        AliyunOcrProvider provider = new AliyunOcrProvider(properties);

        OcrResult result = provider.recognize(new OcrRequest(new byte[]{1}, "resume.pdf", "application/pdf", "/tmp/resume.pdf"));

        assertFalse(result.isSuccess());
        assertEquals("CREDENTIALS_MISSING", result.getErrorCode());
    }

    @Test
    void shouldUseGeneralAsDefaultRecognizeType() {
        OcrProperties properties = new OcrProperties();
        properties.getAliyun().setType(null);

        AliyunOcrProvider provider = new AliyunOcrProvider(properties);

        assertEquals("General", provider.resolveRecognizeType());
    }

    @Test
    void shouldUseAdvancedWhenConfiguredRecognizeTypeIsAdvanced() {
        OcrProperties properties = new OcrProperties();
        properties.getAliyun().setType("Advanced");

        AliyunOcrProvider provider = new AliyunOcrProvider(properties);

        assertEquals("Advanced", provider.resolveRecognizeType());
    }
}
