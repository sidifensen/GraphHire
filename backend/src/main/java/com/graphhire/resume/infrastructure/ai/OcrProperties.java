package com.graphhire.resume.infrastructure.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "ai.parser.ocr")
public class OcrProperties {

    private boolean enabled = true;
    private String provider = "aliyun";
    private int fallbackMinTextLength = 20;
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

    public AliyunProperties getAliyun() {
        return aliyun;
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
