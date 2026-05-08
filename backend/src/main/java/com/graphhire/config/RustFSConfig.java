package com.graphhire.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

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

    @Value("${rustfs.http.socket-timeout-ms:5000}")
    private int socketTimeoutMs;

    @Value("${rustfs.http.connection-timeout-ms:5000}")
    private int connectionTimeoutMs;

    @Value("${rustfs.http.api-call-timeout-ms:5000}")
    private int apiCallTimeoutMs;

    @Value("${rustfs.http.api-call-attempt-timeout-ms:5000}")
    private int apiCallAttemptTimeoutMs;

    @Value("${rustfs.http.max-connections:128}")
    private int maxConnections;

    @Value("${rustfs.http.connection-acquire-timeout-ms:3000}")
    private int connectionAcquireTimeoutMs;

    @Value("${rustfs.http.connection-time-to-live-ms:600000}")
    private int connectionTimeToLiveMs;

    @Value("${rustfs.http.expect-continue-enabled:true}")
    private boolean expectContinueEnabled;

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
                .socketTimeout(Duration.ofMillis(socketTimeoutMs))
                .connectionTimeout(Duration.ofMillis(connectionTimeoutMs))
                .maxConnections(maxConnections)
                .connectionAcquisitionTimeout(Duration.ofMillis(connectionAcquireTimeoutMs))
                .connectionTimeToLive(Duration.ofMillis(connectionTimeToLiveMs))
                .expectContinueEnabled(expectContinueEnabled))
            .overrideConfiguration(ClientOverrideConfiguration.builder()
                .apiCallTimeout(Duration.ofMillis(apiCallTimeoutMs))
                .apiCallAttemptTimeout(Duration.ofMillis(apiCallAttemptTimeoutMs))
                .build())
            .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        String ak = (accessKey == null || accessKey.isBlank()) ? "rustfsadmin" : accessKey;
        String sk = (secretKey == null || secretKey.isBlank()) ? "rustfsadmin" : secretKey;

        return S3Presigner.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(ak, sk)))
            .serviceConfiguration(S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build())
            .build();
    }
}
