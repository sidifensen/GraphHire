package com.graphhire.job.interfaces.dto.response;

import cn.hutool.core.util.StrUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.time.Duration;

@Component
public class CompanyAvatarUrlResolver {

    private final S3Presigner s3Presigner;

    private final String bucketName;

    public CompanyAvatarUrlResolver(S3Presigner s3Presigner,
                                    @Value("${rustfs.bucket:resumes}") String bucketName) {
        this.s3Presigner = s3Presigner;
        this.bucketName = bucketName;
    }

    public String resolve(String avatarPath) {
        if (StrUtil.isBlank(avatarPath)) {
            return null;
        }

        if (StrUtil.startWithAny(avatarPath, "http://", "https://")) {
            return avatarPath;
        }

        String resolvedBucket = bucketName;
        String resolvedKey = StrUtil.removePrefix(avatarPath, "/");
        if (StrUtil.startWith(avatarPath, "s3://")) {
            String path = StrUtil.removePrefix(avatarPath, "s3://");
            int slashIndex = path.indexOf('/');
            if (slashIndex > 0) {
                resolvedBucket = path.substring(0, slashIndex);
                resolvedKey = path.substring(slashIndex + 1);
            }
        }

        return s3Presigner.presignGetObject(GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(6))
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(resolvedBucket)
                        .key(resolvedKey)
                        .build())
                .build())
            .url()
            .toString();
    }
}
