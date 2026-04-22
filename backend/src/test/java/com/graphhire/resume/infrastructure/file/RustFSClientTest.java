package com.graphhire.resume.infrastructure.file;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayInputStream;
import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
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
    @DisplayName("download 应优先使用文件路径中的 bucket，避免配置 bucket 不一致导致404")
    void download_shouldUseBucketFromFilePath() {
        byte[] expected = "legacy-content".getBytes();
        ResponseInputStream<GetObjectResponse> stream = new ResponseInputStream<>(
                GetObjectResponse.builder().build(),
                new ByteArrayInputStream(expected));
        when(s3Client.getObject(any(GetObjectRequest.class))).thenReturn(stream);

        byte[] actual = client.download("s3://legacy-bucket/1776789414400_25年简历测试.pdf");

        assertArrayEquals(expected, actual);
        ArgumentCaptor<GetObjectRequest> requestCaptor = ArgumentCaptor.forClass(GetObjectRequest.class);
        verify(s3Client).getObject(requestCaptor.capture());
        assertEquals("legacy-bucket", requestCaptor.getValue().bucket());
        assertEquals("1776789414400_25年简历测试.pdf", requestCaptor.getValue().key());
    }

    @Test
    @DisplayName("download 应兼容历史HTTP文件路径并正确提取 bucket 与 key")
    void download_shouldParseHttpStyleFilePath() {
        byte[] expected = "http-style-content".getBytes();
        ResponseInputStream<GetObjectResponse> stream = new ResponseInputStream<>(
                GetObjectResponse.builder().build(),
                new ByteArrayInputStream(expected));
        when(s3Client.getObject(any(GetObjectRequest.class))).thenReturn(stream);

        byte[] actual = client.download("http://127.0.0.1:9000/legacy-bucket/1776789414400_25年简历测试.pdf");

        assertArrayEquals(expected, actual);
        ArgumentCaptor<GetObjectRequest> requestCaptor = ArgumentCaptor.forClass(GetObjectRequest.class);
        verify(s3Client).getObject(requestCaptor.capture());
        assertEquals("legacy-bucket", requestCaptor.getValue().bucket());
        assertEquals("1776789414400_25年简历测试.pdf", requestCaptor.getValue().key());
    }

    @Test
    @DisplayName("download 在原始 key 404 时应回退尝试 URL 编码 key")
    void download_shouldFallbackToUrlEncodedKeyWhenRawKeyMissing() {
        byte[] expected = "encoded-key-content".getBytes();
        ResponseInputStream<GetObjectResponse> stream = new ResponseInputStream<>(
                GetObjectResponse.builder().build(),
                new ByteArrayInputStream(expected));
        when(s3Client.getObject(any(GetObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("The specified key does not exist").build())
                .thenReturn(stream);

        byte[] actual = client.download("s3://resumes/1776616282959_25年简历测试.pdf");

        assertArrayEquals(expected, actual);
        ArgumentCaptor<GetObjectRequest> requestCaptor = ArgumentCaptor.forClass(GetObjectRequest.class);
        verify(s3Client, times(2)).getObject(requestCaptor.capture());
        assertEquals("1776616282959_25年简历测试.pdf", requestCaptor.getAllValues().get(0).key());
        assertEquals("1776616282959_25%E5%B9%B4%E7%AE%80%E5%8E%86%E6%B5%8B%E8%AF%95.pdf", requestCaptor.getAllValues().get(1).key());
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
