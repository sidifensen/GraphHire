package com.graphhire.resume.infrastructure.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "ai.parser.ocr")
public class OcrProperties {

    private boolean enabled = true;
    private String provider = "tencent";
    private int fallbackMinTextLength = 20;
    private final TencentProperties tencent = new TencentProperties();
    private final AliyunProperties aliyun = new AliyunProperties();

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public int getFallbackMinTextLength() {
        return fallbackMinTextLength;
    }

    public void setFallbackMinTextLength(int fallbackMinTextLength) {
        this.fallbackMinTextLength = fallbackMinTextLength;
    }

    public TencentProperties getTencent() {
        return tencent;
    }

    public AliyunProperties getAliyun() {
        return aliyun;
    }

    public static class TencentProperties {
        private String secretId;
        private String secretKey;
        private String region = "ap-guangzhou";

        public String getSecretId() {
            return secretId;
        }

        public void setSecretId(String secretId) {
            this.secretId = secretId;
        }

        public String getSecretKey() {
            return secretKey;
        }

        public void setSecretKey(String secretKey) {
            this.secretKey = secretKey;
        }

        public String getRegion() {
            return region;
        }

        public void setRegion(String region) {
            this.region = region;
        }
    }

    public static class AliyunProperties {
        private String accessKeyId;
        private String accessKeySecret;
        private String endpoint = "ocr-api.cn-hangzhou.aliyuncs.com";

        public String getAccessKeyId() {
            return accessKeyId;
        }

        public void setAccessKeyId(String accessKeyId) {
            this.accessKeyId = accessKeyId;
        }

        public String getAccessKeySecret() {
            return accessKeySecret;
        }

        public void setAccessKeySecret(String accessKeySecret) {
            this.accessKeySecret = accessKeySecret;
        }

        public String getEndpoint() {
            return endpoint;
        }

        public void setEndpoint(String endpoint) {
            this.endpoint = endpoint;
        }
    }
}
