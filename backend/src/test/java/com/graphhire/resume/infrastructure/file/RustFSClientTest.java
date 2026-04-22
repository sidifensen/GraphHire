package com.graphhire.resume.infrastructure.file;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayInputStream;
import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RustFSClientTest {

    @Mock
    private S3Client s3Client;

    private RustFSClient client;

    @BeforeEach
    void setUp() throws Exception {
        client = new RustFSClient();
        setField(client, "s3Client", s3Client);
        setField(client, "bucketName", "resumes");
    }

    @Test
    @DisplayName("download 应使用 S3 SDK 直接读取对象内容")
    void download_shouldReadBytesViaS3Client() {
        byte[] expected = "test-content".getBytes();
        ResponseInputStream<GetObjectResponse> stream = new ResponseInputStream<>(
                GetObjectResponse.builder().build(),
                new ByteArrayInputStream(expected));
        when(s3Client.getObject(any(GetObjectRequest.class))).thenReturn(stream);

        byte[] actual = client.download("s3://resumes/1776789414400_25年简历测试.pdf");

        assertArrayEquals(expected, actual);
        verify(s3Client).getObject(any(GetObjectRequest.class));
    }

    @Test
    @DisplayName("download 对无效路径应抛出明确异常")
    void download_shouldThrowWhenPathInvalid() {
        RuntimeException ex = assertThrows(RuntimeException.class, () -> client.download("invalid"));
        assertEquals("Invalid S3 path: invalid", ex.getMessage());
    }

    @Test
    @DisplayName("upload 应保留文件扩展名并写入对应 content-type")
    void upload_shouldUseDetectedContentType() {
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class))).thenReturn(null);

        client.upload("data".getBytes(), "简历.pdf");

        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field f = target.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(target, value);
    }
}
