package com.graphhire.resume.infrastructure.file;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import java.io.InputStream;

/**
 * RustFS文件存储客户端
 *
 * 【模块说明】封装与RustFS S3兼容存储的交互，提供文件上传、下载、删除能力。
 * 【数据来源】S3兼容对象存储（RustFS）。
 *
 * 【方法概览】
 * - upload()：S3 SDK直接上传
 * - download()：S3 SDK直接下载
 * - delete()：S3 SDK直接删除
 */
@Component
public class RustFSClient {

    private static final Logger log = LoggerFactory.getLogger(RustFSClient.class);

    /** S3客户端，仅用于delete/exists等管理操作 */
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
     * 上传文件到S3存储（直接S3 PUT，避免预签名URL的签名兼容性问题）
     */
    public String upload(byte[] bytes, String fileName) {
        String key = System.currentTimeMillis() + "_" + fileName;

        try {
            ensureBucketExists();

            s3Client.putObject(PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(getContentType(key))
                .build(), software.amazon.awssdk.core.sync.RequestBody.fromBytes(bytes));

            return "s3://" + bucketName + "/" + key;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to RustFS: " + e.getMessage(), e);
        }
    }

    /**
     * 确保bucket存在，不存在则创建
     */
    private void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
        } catch (NoSuchBucketException e) {
            log.info("Bucket '{}' does not exist, creating...", bucketName);
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
            log.info("Bucket '{}' created", bucketName);
        } catch (Exception e) {
            log.error("Failed to ensure bucket exists: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to ensure bucket exists: " + e.getMessage(), e);
        }
    }

    /**
     * 从S3存储下载文件（S3 SDK直接GET，避免预签名URL编码与签名兼容问题）
     */
    public byte[] download(String filePath) {
        String key = extractKey(filePath);

        try (InputStream is = s3Client.getObject(GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build())) {
            return is.readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file from RustFS: " + e.getMessage(), e);
        }
    }

    /**
     * 从S3存储删除文件（S3 SDK直接删除）
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
     * 检查文件是否存在（S3 SDK）
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
