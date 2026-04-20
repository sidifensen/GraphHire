package com.graphhire.resume.infrastructure.file;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

/**
 * RustFS文件存储客户端
 *
 * 【模块说明】封装与RustFS S3兼容存储的交互，提供文件上传、下载、删除能力。
 * 【数据来源】S3兼容对象存储（RustFS）。
 *
 * 【方法概览】
 * - upload()：上传文件到S3存储
 * - download()：从S3存储下载文件
 * - delete()：从S3存储删除文件
 */
@Component
public class RustFSClient {

    /** S3客户端，由 RustFSConfig 配置注入 */
    @Autowired
    private S3Client s3Client;

    /** RustFS bucket 名称 */
    @Value("${rustfs.bucket:resumes}")
    private String bucketName;

    /**
     * 上传文件到S3存储
     * @param bytes 文件字节数据
     * @param fileName 原始文件名
     * @return S3存储路径（s3://bucket/xxx）
     */
    public String upload(byte[] bytes, String fileName) {
        String key = System.currentTimeMillis() + "_" + fileName;

        try {
            // 确保 bucket 存在
            ensureBucketExists();

            // 上传文件
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
     * @param filePath S3文件路径（s3://bucket/key）
     * @return 文件字节数据
     */
    public byte[] download(String filePath) {
        String key = extractKey(filePath);

        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

            return s3Client.getObjectAsBytes(getRequest).asByteArray();
        } catch (NoSuchKeyException e) {
            throw new RuntimeException("File not found in RustFS: " + filePath, e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file from RustFS: " + e.getMessage(), e);
        }
    }

    /**
     * 从S3存储删除文件
     * @param filePath S3文件路径（s3://bucket/key）
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
     * @param filePath S3文件路径
     * @return 是否存在
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
     * 确保 bucket 存在，不存在则创建
     */
    private void ensureBucketExists() {
        try {
            HeadBucketRequest headRequest = HeadBucketRequest.builder()
                .bucket(bucketName)
                .build();
            s3Client.headBucket(headRequest);
        } catch (NoSuchBucketException e) {
            // Bucket 不存在，创建它
            CreateBucketRequest createRequest = CreateBucketRequest.builder()
                .bucket(bucketName)
                .build();
            s3Client.createBucket(createRequest);
        }
    }

    /**
     * 从 S3 路径提取 key
     * s3://bucket/key -> key
     */
    private String extractKey(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException("File path cannot be empty");
        }
        // 移除 s3:// 前缀
        String path = filePath.replace("s3://", "");
        int slashIndex = path.indexOf('/');
        if (slashIndex < 0) {
            throw new IllegalArgumentException("Invalid S3 path: " + filePath);
        }
        return path.substring(slashIndex + 1);
    }

    /**
     * 根据文件名获取 Content-Type
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