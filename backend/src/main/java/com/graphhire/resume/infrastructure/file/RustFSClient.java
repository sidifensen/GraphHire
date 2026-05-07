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
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashSet;
import java.util.Set;
import cn.hutool.core.util.StrUtil;
import software.amazon.awssdk.core.sync.RequestBody;

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
    @Value("${rustfs.endpoint:http://localhost:9000}")
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

    private volatile boolean bucketEnsured;

    /**
     * 上传文件到S3存储（直接S3 PUT，避免预签名URL的签名兼容性问题）
     */
    public String upload(byte[] bytes, String fileName) {
        return upload(new java.io.ByteArrayInputStream(bytes), bytes.length, fileName);
    }

    public String upload(InputStream inputStream, long contentLength, String fileName) {
        String key = fileName;

        try {
            ensureBucketExists();

            s3Client.putObject(PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(getContentType(key))
                .build(), RequestBody.fromInputStream(inputStream, contentLength));

            return "s3://" + bucketName + "/" + key;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to RustFS: " + e.getMessage(), e);
        }
    }

    /**
     * 确保bucket存在，不存在则创建
     */
    private void ensureBucketExists() {
        if (bucketEnsured) {
            return;
        }
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
            bucketEnsured = true;
        } catch (NoSuchBucketException e) {
            log.info("桶'{}'不存在，正在创建...", bucketName);
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
            log.info("桶'{}'创建成功", bucketName);
            bucketEnsured = true;
        } catch (Exception e) {
            log.error("确保桶存在失败: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to ensure bucket exists: " + e.getMessage(), e);
        }
    }

    /**
     * 从S3存储下载文件（S3 SDK直接GET，避免预签名URL编码与签名兼容问题）
     */
    public byte[] download(String filePath) {
        ObjectLocation objectLocation = resolveObjectLocation(filePath);

        Exception lastException = null;
        for (String candidateKey : buildCandidateKeys(objectLocation.key())) {
            try (InputStream is = s3Client.getObject(GetObjectRequest.builder()
                    .bucket(objectLocation.bucket())
                    .key(candidateKey)
                    .build())) {
                if (!StrUtil.equals(candidateKey, objectLocation.key())) {
                    log.warn("RustFS Key降级命中，原Key='{}'，解析后Key='{}'", objectLocation.key(), candidateKey);
                }
                return is.readAllBytes();
            } catch (NoSuchKeyException e) {
                lastException = e;
            } catch (S3Exception e) {
                if (e.statusCode() == 404) {
                    lastException = e;
                    continue;
                }
                throw new RuntimeException("Failed to download file from RustFS: " + e.getMessage(), e);
            } catch (Exception e) {
                throw new RuntimeException("Failed to download file from RustFS: " + e.getMessage(), e);
            }
        }

        String message = lastException != null ? lastException.getMessage() : "The specified key does not exist";
        throw new RuntimeException("Failed to download file from RustFS: " + message, lastException);
    }

    /**
     * 从S3存储删除文件（S3 SDK直接删除）
     */
    public void delete(String filePath) {
        ObjectLocation objectLocation = resolveObjectLocation(filePath);

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(objectLocation.bucket())
                .key(objectLocation.key())
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
        ObjectLocation objectLocation = resolveObjectLocation(filePath);

        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                .bucket(objectLocation.bucket())
                .key(objectLocation.key())
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
     * 解析对象存储位置，优先使用文件路径中的 bucket。
     */
    private ObjectLocation resolveObjectLocation(String filePath) {
        if (StrUtil.isBlank(filePath)) {
            throw new IllegalArgumentException("File path cannot be empty");
        }

        if (StrUtil.startWith(filePath, "s3://")) {
            String path = StrUtil.removePrefix(filePath, "s3://");
            int slashIndex = path.indexOf('/');
            if (slashIndex < 0) {
                throw new IllegalArgumentException("Invalid S3 path: " + filePath);
            }

            String pathBucket = path.substring(0, slashIndex);
            String key = path.substring(slashIndex + 1);
            if (StrUtil.isBlank(pathBucket) || StrUtil.isBlank(key)) {
                throw new IllegalArgumentException("Invalid S3 path: " + filePath);
            }
            return new ObjectLocation(pathBucket, key);
        }

        if (StrUtil.startWithAny(filePath, "http://", "https://")) {
            URI uri = URI.create(filePath);
            String path = StrUtil.removePrefix(uri.getPath(), "/");
            int slashIndex = path.indexOf('/');
            if (slashIndex < 0) {
                throw new IllegalArgumentException("Invalid S3 path: " + filePath);
            }

            String pathBucket = path.substring(0, slashIndex);
            String key = path.substring(slashIndex + 1);
            if (StrUtil.isBlank(pathBucket) || StrUtil.isBlank(key)) {
                throw new IllegalArgumentException("Invalid S3 path: " + filePath);
            }
            return new ObjectLocation(pathBucket, key);
        }

        if (!StrUtil.contains(filePath, "/")) {
            throw new IllegalArgumentException("Invalid S3 path: " + filePath);
        }

        return new ObjectLocation(bucketName, StrUtil.removePrefix(filePath, "/"));
    }

    private record ObjectLocation(String bucket, String key) {}

    private Set<String> buildCandidateKeys(String rawKey) {
        Set<String> candidates = new LinkedHashSet<>();
        candidates.add(rawKey);

        String encodedKey = URLEncoder.encode(rawKey, StandardCharsets.UTF_8)
                .replace("+", "%20")
                .replace("%2F", "/");
        candidates.add(encodedKey);

        try {
            candidates.add(URLDecoder.decode(rawKey, StandardCharsets.UTF_8));
        } catch (IllegalArgumentException ignored) {
            // ignore invalid encoded key input and keep raw/encoded candidates
        }

        return candidates;
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
