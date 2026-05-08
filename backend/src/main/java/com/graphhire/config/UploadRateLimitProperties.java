package com.graphhire.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 上传限流配置。
 * 说明：支持按场景配置用户级和全局级令牌桶参数，用于运行期动态调优上传吞吐。
 */
@Component
@ConfigurationProperties(prefix = "app.upload.rate-limit")
public class UploadRateLimitProperties {

    /** 限流总开关。 */
    private boolean enabled = true;

    /** Redis 限流键前缀，避免与其他业务键冲突。 */
    private String keyPrefix = "upload:rate-limit";

    /** 不同上传场景的限流规则。 */
    private Map<String, SceneRule> scenes = new HashMap<>();

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getKeyPrefix() {
        return keyPrefix;
    }

    public void setKeyPrefix(String keyPrefix) {
        this.keyPrefix = keyPrefix;
    }

    public Map<String, SceneRule> getScenes() {
        return scenes;
    }

    public void setScenes(Map<String, SceneRule> scenes) {
        this.scenes = scenes;
    }

    /**
     * 场景级配置（如简历上传、头像上传）。
     */
    public static class SceneRule {
        /** 当前场景是否启用限流。 */
        private boolean enabled = true;
        /** 用户维度限流（防止单用户突发）。 */
        private BucketRule user = new BucketRule();
        /** 全局维度限流（保护整体系统）。 */
        private BucketRule global = new BucketRule();

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public BucketRule getUser() {
            return user;
        }

        public void setUser(BucketRule user) {
            this.user = user;
        }

        public BucketRule getGlobal() {
            return global;
        }

        public void setGlobal(BucketRule global) {
            this.global = global;
        }
    }

    /**
     * 令牌桶规则。
     */
    public static class BucketRule {
        /** 桶容量（最大令牌数）。 */
        private long capacity = 10;
        /** 每次补充令牌数。 */
        private long refillTokens = 10;
        /** 补充周期（秒）。 */
        private long refillSeconds = 60;

        public long getCapacity() {
            return capacity;
        }

        public void setCapacity(long capacity) {
            this.capacity = capacity;
        }

        public long getRefillTokens() {
            return refillTokens;
        }

        public void setRefillTokens(long refillTokens) {
            this.refillTokens = refillTokens;
        }

        public long getRefillSeconds() {
            return refillSeconds;
        }

        public void setRefillSeconds(long refillSeconds) {
            this.refillSeconds = refillSeconds;
        }
    }
}
