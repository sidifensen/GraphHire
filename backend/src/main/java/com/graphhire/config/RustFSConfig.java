package com.graphhire.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.http.apache.ApacheHttpClient;

import java.net.URI;
import java.time.Duration;

@Configuration
public class RustFSConfig {
    @Value("${rustfs.endpoint:http://localhost:9000}")
    private String endpoint;

    @Value("${rustfs.access-key:}")
    private String accessKey;

    @Value("${rustfs.secret-key:}")
    private String secretKey;

    @Value("${rustfs.region:us-east-1}")
    private String region;

    @Bean
    public S3Client s3Client() {
        String ak = (accessKey == null || accessKey.isBlank()) ? "rustfsadmin" : accessKey;
        String sk = (secretKey == null || secretKey.isBlank()) ? "rustfsadmin" : secretKey;

        return S3Client.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(ak, sk)))
            .forcePathStyle(true)
            .httpClientBuilder(ApacheHttpClient.builder()
                .socketTimeout(Duration.ofSeconds(5))
                .connectionTimeout(Duration.ofSeconds(5)))
            .overrideConfiguration(ClientOverrideConfiguration.builder()
                .apiCallTimeout(Duration.ofSeconds(5))
                .apiCallAttemptTimeout(Duration.ofSeconds(5))
                .build())
            .build();
    }
}
