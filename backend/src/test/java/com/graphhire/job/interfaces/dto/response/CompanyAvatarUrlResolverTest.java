package com.graphhire.job.interfaces.dto.response;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;

class CompanyAvatarUrlResolverTest {

    private CompanyAvatarUrlResolver createResolver() {
        S3Presigner presigner = S3Presigner.builder()
                .endpointOverride(URI.create("http://localhost:9000"))
                .region(Region.of("us-east-1"))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create("rustfsadmin", "rustfsadmin")
                ))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .build();
        return new CompanyAvatarUrlResolver(presigner, "resumes");
    }

    @Test
    @DisplayName("纯 key 应解析为可访问的预签名地址")
    void resolve_WhenUsingPlainKey_ShouldBuildPresignedUrl() {
        CompanyAvatarUrlResolver resolver = createResolver();

        String url = resolver.resolve("avatar/1987654321098767360.png");

        assertTrue(url.startsWith("http://localhost:9000/resumes/avatar/1987654321098767360.png"));
        assertTrue(url.contains("X-Amz-Algorithm=AWS4-HMAC-SHA256"));
    }

    @Test
    @DisplayName("空路径应返回 null")
    void resolve_WhenPathIsBlank_ShouldReturnNull() {
        CompanyAvatarUrlResolver resolver = createResolver();

        assertNull(resolver.resolve(null));
        assertNull(resolver.resolve(" "));
    }

    @Test
    @DisplayName("s3 路径应解析为可访问的预签名地址")
    void resolve_WhenUsingS3Path_ShouldBuildPresignedUrl() {
        CompanyAvatarUrlResolver resolver = createResolver();

        String url = resolver.resolve("s3://resumes/avatar/1987654321098767360.png");

        assertTrue(url.startsWith("http://localhost:9000/resumes/avatar/1987654321098767360.png"));
        assertTrue(url.contains("X-Amz-Algorithm=AWS4-HMAC-SHA256"));
    }
}
