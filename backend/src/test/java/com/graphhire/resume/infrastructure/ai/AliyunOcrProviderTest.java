package com.graphhire.resume.infrastructure.ai;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

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
}
