package com.graphhire.resume.infrastructure.ai;

import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

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
}
