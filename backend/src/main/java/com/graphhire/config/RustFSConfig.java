package com.graphhire.infrastructure.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;

@Configuration
public class RustFSConfig {
    @Value("${rustfs.endpoint}")
    private String endpoint;

    @Value("${rustfs.access-key:}")
    private String accessKey;

    @Value("${rustfs.secret-key:}")
    private String secretKey;

    @Value("${rustfs.region:us-east-1}")
    private String region;

    @Bean
    public S3Client s3Client() {
        // Use placeholder credentials if not configured, for local development
        String ak = (accessKey == null || accessKey.isBlank()) ? "local" : accessKey;
        String sk = (secretKey == null || secretKey.isBlank()) ? "local" : secretKey;

        return S3Client.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(ak, sk)))
            .forcePathStyle(true)
            .build();
    }
}
