package com.graphhire.resume.infrastructure.file;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RustFSClientTest {

    @Mock
    private S3Client s3Client;

    @InjectMocks
    private RustFSClient rustFSClient;

    @Test
    @DisplayName("upload 应原样使用调用方传入的对象 key")
    void upload_ShouldUseProvidedKeyAsIs() {
        ReflectionTestUtils.setField(rustFSClient, "bucketName", "resumes");
        when(s3Client.headBucket(any(HeadBucketRequest.class))).thenReturn(HeadBucketResponse.builder().build());

        String filePath = rustFSClient.upload("avatar".getBytes(), "avatar/1987654321098767360.png");

        ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(requestCaptor.capture(), any(software.amazon.awssdk.core.sync.RequestBody.class));

        assertEquals("avatar/1987654321098767360.png", requestCaptor.getValue().key());
        assertTrue(filePath.endsWith("/avatar/1987654321098767360.png"));
    }

    @Test
    @DisplayName("upload 多次调用应复用桶存在检查缓存")
    void upload_ShouldHeadBucketOnlyOnceWhenCached() {
        ReflectionTestUtils.setField(rustFSClient, "bucketName", "resumes");
        when(s3Client.headBucket(any(HeadBucketRequest.class))).thenReturn(HeadBucketResponse.builder().build());

        rustFSClient.upload("a".getBytes(), "chat/image/a.png");
        rustFSClient.upload("b".getBytes(), "chat/image/b.png");

        verify(s3Client, times(1)).headBucket(any(HeadBucketRequest.class));
        verify(s3Client, times(2)).putObject(any(PutObjectRequest.class), any(software.amazon.awssdk.core.sync.RequestBody.class));
    }
}
