package com.graphhire.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "app.upload.rate-limit")
public class UploadRateLimitProperties {

    private boolean enabled = true;

    private String keyPrefix = "upload:rate-limit";

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

    public static class SceneRule {
        private boolean enabled = true;
        private BucketRule user = new BucketRule();
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

    public static class BucketRule {
        private long capacity = 10;
        private long refillTokens = 10;
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
