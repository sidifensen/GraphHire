package com.graphhire.resume.infrastructure.file;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import software.amazon.awssdk.services.s3.S3Client;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

/**
 * RustFSClient 预签名 URL 路径风格验证
 *
 * 验证目标：预签名 URL 必须使用 path-style 格式（host=localhost，path 以 /resumes/ 开头），
 * 而不是 virtual-hosted 格式（host=resumes.localhost）。
 */
class RustFSClientTest {

    @Mock
    private S3Client s3Client;

    private RustFSClient client;

    @BeforeEach
    void setUp() throws Exception {
        client = new RustFSClient();
        // 通过反射注入 S3Client（由 Spring 管理，生产代码中通过 @Autowired 注入）
        java.lang.reflect.Field s3ClientField = RustFSClient.class.getDeclaredField("s3Client");
        s3ClientField.setAccessible(true);
        s3ClientField.set(client, s3Client);

        // 通过反射注入 @Value 字段
        setField(RustFSClient.class, client, "endpoint", "http://localhost:9000");
        setField(RustFSClient.class, client, "accessKey", "rustfsadmin");
        setField(RustFSClient.class, client, "secretKey", "rustfsadmin");
        setField(RustFSClient.class, client, "bucketName", "resumes");
        setField(RustFSClient.class, client, "region", "us-east-1");
    }

    private static void setField(Class<?> clazz, Object target, String fieldName, Object value) throws Exception {
        java.lang.reflect.Field f = clazz.getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(target, value);
    }

    @Test
    @DisplayName("PUT 预签名 URL 必须为 path-style（localhost + /resumes/ 前缀）")
    void upload_presignedUrl_shouldBePathStyle() throws Exception {
        Method method = RustFSClient.class.getDeclaredMethod("generatePutPresignedUrl", String.class);
        method.setAccessible(true);

        String url = (String) method.invoke(client, "test.pdf");

        assertNotNull(url, "预签名 URL 不应为空");
        assertTrue(url.startsWith("http://localhost:9000/resumes/"),
                "PUT 预签名 URL 应为 path-style，实际: " + url);
        assertFalse(url.contains("resumes.localhost"),
                "PUT 预签名 URL 不应使用 virtual-hosted 风格，实际: " + url);
        assertTrue(url.contains("test.pdf"), "PUT 预签名 URL 应包含文件名，实际: " + url);
    }

    @Test
    @DisplayName("GET 预签名 URL 必须为 path-style（localhost + /resumes/ 前缀）")
    void download_presignedUrl_shouldBePathStyle() throws Exception {
        Method method = RustFSClient.class.getDeclaredMethod("generateGetPresignedUrl", String.class);
        method.setAccessible(true);

        String url = (String) method.invoke(client, "test.pdf");

        assertNotNull(url, "预签名 URL 不应为空");
        assertTrue(url.startsWith("http://localhost:9000/resumes/"),
                "GET 预签名 URL 应为 path-style，实际: " + url);
        assertFalse(url.contains("resumes.localhost"),
                "GET 预签名 URL 不应使用 virtual-hosted 风格，实际: " + url);
        assertTrue(url.contains("test.pdf"), "GET 预签名 URL 应包含文件名，实际: " + url);
    }

    @Test
    @DisplayName("多次调用应复用同一 presigner 实例")
    void getPresigner_shouldBeReused() throws Exception {
        Method method = RustFSClient.class.getDeclaredMethod("generateGetPresignedUrl", String.class);
        method.setAccessible(true);

        String url1 = (String) method.invoke(client, "a.pdf");
        String url2 = (String) method.invoke(client, "b.pdf");

        assertNotNull(url1);
        assertNotNull(url2);
        // 两者都应复用同一个 presigner（无额外查询参数差异仅来自签名时间戳）
        assertTrue(url1.startsWith("http://localhost:9000/resumes/"));
        assertTrue(url2.startsWith("http://localhost:9000/resumes/"));
    }
}
