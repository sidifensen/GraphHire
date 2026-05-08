package com.graphhire.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.s3.S3Client;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class RustFSConfigTest {

    @Test
    @DisplayName("s3Client 应支持连接池参数配置并成功构建")
    void s3Client_shouldBuildWithHttpConfig() {
        RustFSConfig config = new RustFSConfig();
        ReflectionTestUtils.setField(config, "endpoint", "http://localhost:9000");
        ReflectionTestUtils.setField(config, "accessKey", "ak");
        ReflectionTestUtils.setField(config, "secretKey", "sk");
        ReflectionTestUtils.setField(config, "region", "us-east-1");
        ReflectionTestUtils.setField(config, "socketTimeoutMs", 5000);
        ReflectionTestUtils.setField(config, "connectionTimeoutMs", 5000);
        ReflectionTestUtils.setField(config, "apiCallTimeoutMs", 5000);
        ReflectionTestUtils.setField(config, "apiCallAttemptTimeoutMs", 5000);
        ReflectionTestUtils.setField(config, "maxConnections", 64);
        ReflectionTestUtils.setField(config, "connectionAcquireTimeoutMs", 2000);
        ReflectionTestUtils.setField(config, "connectionTimeToLiveMs", 120000);
        ReflectionTestUtils.setField(config, "expectContinueEnabled", true);

        S3Client client = config.s3Client();
        assertNotNull(client);
        client.close();
    }
}
