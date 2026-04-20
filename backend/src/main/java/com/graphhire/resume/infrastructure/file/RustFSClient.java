package com.graphhire.resume.infrastructure.file;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Utilities;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
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
 * - upload()：预签名URL + HTTP PUT上传
 * - download()：预签名URL + HTTP GET下载
 * - delete()：S3 SDK直接删除
 */
@Component
public class RustFSClient {

    /** S3客户端，仅用于delete/exists等管理操作 */
    @Autowired
    private S3Client s3Client;

    /** S3预签名器，用于生成上传/下载URL */
    private S3Presigner presigner;

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

    /** 预签名URL有效期（分钟） */
    private static final int PRESIGN_EXPIRY_MINUTES = 5;

    /** HTTP连接超时（毫秒） */
    private static final int HTTP_CONNECT_TIMEOUT = 5000;

    /** HTTP读取超时（毫秒） */
    private static final int HTTP_READ_TIMEOUT = 30000;

    /**
     * 上传文件到S3存储（预签名URL + HTTP PUT，避免SDK HTTP client hang）
     */
    public String upload(byte[] bytes, String fileName) {
        String key = System.currentTimeMillis() + "_" + fileName;

        try {
            String presignedUrl = generatePutPresignedUrl(key);

            int responseCode = doHttpPut(presignedUrl, bytes);

            if (responseCode != 200 && responseCode != 201) {
                throw new RuntimeException("Failed to upload to RustFS: HTTP " + responseCode);
            }

            return "s3://" + bucketName + "/" + key;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to RustFS: " + e.getMessage(), e);
        }
    }

    /**
     * 从S3存储下载文件（预签名URL + HTTP GET）
     */
    public byte[] download(String filePath) {
        String key = extractKey(filePath);

        try {
            String presignedUrl = generateGetPresignedUrl(key);
            return doHttpGet(presignedUrl, key);
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file from RustFS: " + e.getMessage(), e);
        }
    }

    /**
     * 生成PUT操作的预签名URL
     */
    private String generatePutPresignedUrl(String key) {
        S3Presigner p = getPresigner();
        PutObjectRequest putRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(getContentType(key))
            .build();
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(PRESIGN_EXPIRY_MINUTES))
            .putObjectRequest(putRequest)
            .build();
        PresignedPutObjectRequest presigned = p.presignPutObject(presignRequest);
        return presigned.url().toString();
    }

    /**
     * 生成GET操作的预签名URL
     */
    private String generateGetPresignedUrl(String key) {
        S3Presigner p = getPresigner();
        GetObjectRequest getRequest = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build();
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(PRESIGN_EXPIRY_MINUTES))
            .getObjectRequest(getRequest)
            .build();
        PresignedGetObjectRequest presigned = p.presignGetObject(presignRequest);
        return presigned.url().toString();
    }

    /**
     * 获取预签名器（复用实例）
     */
    private S3Presigner getPresigner() {
        if (presigner == null) {
            String ak = (accessKey == null || accessKey.isBlank()) ? "rustfsadmin" : accessKey;
            String sk = (secretKey == null || secretKey.isBlank()) ? "rustfsadmin" : secretKey;
            presigner = S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(ak, sk)))
                .build();
        }
        return presigner;
    }

    /**
     * HTTP PUT上传（使用预签名URL）
     */
    private int doHttpPut(String presignedUrl, byte[] data) throws IOException {
        URL url = new URL(presignedUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("PUT");
        connection.setDoOutput(true);
        connection.setConnectTimeout(HTTP_CONNECT_TIMEOUT);
        connection.setReadTimeout(HTTP_READ_TIMEOUT);

        // 预签名URL已包含必要的签名头，直接发送body
        try (OutputStream os = connection.getOutputStream()) {
            os.write(data);
            os.flush();
        }

        return connection.getResponseCode();
    }

    /**
     * HTTP GET下载（使用预签名URL）
     */
    private byte[] doHttpGet(String presignedUrl, String key) throws IOException {
        URL url = new URL(presignedUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(HTTP_CONNECT_TIMEOUT);
        connection.setReadTimeout(HTTP_READ_TIMEOUT);

        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_NOT_FOUND) {
            throw new RuntimeException("File not found in RustFS: s3://" + bucketName + "/" + key);
        }
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw new RuntimeException("Failed to download from RustFS: HTTP " + responseCode);
        }

        try (InputStream is = connection.getInputStream()) {
            return is.readAllBytes();
        } finally {
            connection.disconnect();
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
