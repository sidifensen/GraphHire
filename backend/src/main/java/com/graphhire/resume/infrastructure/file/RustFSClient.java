package com.graphhire.resume.infrastructure.file;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Utilities;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.time.Duration;

/**
 * RustFS文件存储客户端
 *
 * 【模块说明】封装与RustFS S3兼容存储的交互，提供文件上传、下载、删除能力。
 * 【数据来源】S3兼容对象存储（RustFS）。
 *
 * 【方法概览】
 * - upload()：上传文件到S3存储
 * - download()：从S3存储下载文件（预签名URL + HttpURLConnection，避免SDK连接hang）
 * - delete()：从S3存储删除文件
 */
@Component
public class RustFSClient {

    /** S3客户端，用于upload/delete/exists */
    @Autowired
    private S3Client s3Client;

    /** RustFS endpoint */
    @Value("${rustfs.endpoint}")
    private String endpoint;

    /** RustFS access key */
    @Value("${rustfs.access-key:}")
    private String accessKey;

    /** RustFS secret key */
    @Value("${rustfs.secret-key:}")
    private String secretKey;

    /** RustFS bucket 名称 */
    @Value("${rustfs.bucket:resumes}")
    private String bucketName;

    /** RustFS region */
    @Value("${rustfs.region:us-east-1}")
    private String region;

    /**
     * 上传文件到S3存储
     */
    public String upload(byte[] bytes, String fileName) {
        String key = System.currentTimeMillis() + "_" + fileName;

        try {
            ensureBucketExists();

            PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(getContentType(fileName))
                .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(bytes));

            return "s3://" + bucketName + "/" + key;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to RustFS: " + e.getMessage(), e);
        }
    }

    /**
     * 从S3存储下载文件
     * 使用预签名URL + HttpURLConnection，避免AWS SDK在Windows上连接hang的问题
     */
    public byte[] download(String filePath) {
        String key = extractKey(filePath);

        try {
            // 生成预签名URL（有效期5分钟）
            String presignedUrl = generatePresignedUrl(key);

            // 用HttpURLConnection下载（设置超时）
            return downloadViaHttp(presignedUrl, key);
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file from RustFS: " + e.getMessage(), e);
        }
    }

    /**
     * 生成预签名URL
     */
    private String generatePresignedUrl(String key) {
        String ak = (accessKey == null || accessKey.isBlank()) ? "rustfsadmin" : accessKey;
        String sk = (secretKey == null || secretKey.isBlank()) ? "rustfsadmin" : secretKey;

        try (S3Presigner presigner = S3Presigner.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of(region))
            .credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(ak, sk)))
            .build()) {

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(5))
                .getObjectRequest(getObjectRequest)
                .build();

            PresignedGetObjectRequest presignedReq = presigner.presignGetObject(presignRequest);
            return presignedReq.url().toString();
        }
    }

    /**
     * 用HttpURLConnection下载预签名URL（带超时）
     */
    private byte[] downloadViaHttp(String presignedUrl, String key) throws IOException {
        URL url = new URL(presignedUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setConnectTimeout(5000);  // 5秒连接超时
        connection.setReadTimeout(30000);    // 30秒读超时

        try {
            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_NOT_FOUND) {
                throw new RuntimeException("File not found in RustFS: s3://" + bucketName + "/" + key);
            }
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new RuntimeException("Failed to download from RustFS: HTTP " + responseCode);
            }

            try (InputStream is = connection.getInputStream()) {
                return is.readAllBytes();
            }
        } finally {
            connection.disconnect();
        }
    }

    /**
     * 从S3存储删除文件
     */
    public void delete(String filePath) {
        String key = extractKey(filePath);

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

            s3Client.deleteObject(deleteRequest);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file from RustFS: " + e.getMessage(), e);
        }
    }

    /**
     * 检查文件是否存在
     */
    public boolean exists(String filePath) {
        String key = extractKey(filePath);

        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

            s3Client.headObject(headRequest);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 确保 bucket 存在
     */
    private void ensureBucketExists() {
        try {
            HeadBucketRequest headRequest = HeadBucketRequest.builder()
                .bucket(bucketName)
                .build();
            s3Client.headBucket(headRequest);
        } catch (NoSuchBucketException e) {
            CreateBucketRequest createRequest = CreateBucketRequest.builder()
                .bucket(bucketName)
                .build();
            s3Client.createBucket(createRequest);
        }
    }

    /**
     * 从S3路径提取key
     */
    private String extractKey(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException("File path cannot be empty");
        }
        String path = filePath.replace("s3://", "");
        int slashIndex = path.indexOf('/');
        if (slashIndex < 0) {
            throw new IllegalArgumentException("Invalid S3 path: " + filePath);
        }
        return path.substring(slashIndex + 1);
    }

    /**
     * 根据文件名获取Content-Type
     */
    private String getContentType(String fileName) {
        if (fileName == null) return "application/octet-stream";
        String lowerName = fileName.toLowerCase();
        if (lowerName.endsWith(".pdf")) return "application/pdf";
        if (lowerName.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lowerName.endsWith(".doc")) return "application/msword";
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";
        if (lowerName.endsWith(".png")) return "image/png";
        if (lowerName.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }
}
