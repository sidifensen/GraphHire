package com.graphhire.upload.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.config.UploadRateLimitProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class UploadRateLimitService {

    private static final DefaultRedisScript<Long> TOKEN_BUCKET_SCRIPT;

    static {
        TOKEN_BUCKET_SCRIPT = new DefaultRedisScript<>();
        TOKEN_BUCKET_SCRIPT.setResultType(Long.class);
        TOKEN_BUCKET_SCRIPT.setScriptText("""
            local tokens_key = KEYS[1]
            local ts_key = KEYS[2]
            local now_ms = tonumber(ARGV[1])
            local capacity = tonumber(ARGV[2])
            local refill_tokens = tonumber(ARGV[3])
            local refill_ms = tonumber(ARGV[4])
            local requested = tonumber(ARGV[5])
            local ttl_seconds = tonumber(ARGV[6])

            if capacity <= 0 or refill_tokens <= 0 or refill_ms <= 0 or requested <= 0 then
              return 0
            end

            local last_tokens = tonumber(redis.call('GET', tokens_key))
            if last_tokens == nil then
              last_tokens = capacity
            end

            local last_refreshed = tonumber(redis.call('GET', ts_key))
            if last_refreshed == nil then
              last_refreshed = now_ms
            end

            local elapsed = now_ms - last_refreshed
            if elapsed < 0 then
              elapsed = 0
            end

            local refill_count = math.floor(elapsed / refill_ms)
            local filled_tokens = last_tokens
            local new_refreshed = last_refreshed
            if refill_count > 0 then
              filled_tokens = math.min(capacity, last_tokens + refill_count * refill_tokens)
              new_refreshed = last_refreshed + refill_count * refill_ms
            end

            local allowed = 0
            if filled_tokens >= requested then
              allowed = 1
              filled_tokens = filled_tokens - requested
            end

            redis.call('SETEX', tokens_key, ttl_seconds, tostring(filled_tokens))
            redis.call('SETEX', ts_key, ttl_seconds, tostring(new_refreshed))
            return allowed
            """);
    }

    public static final String SCENE_RESUME_UPLOAD = "resume";
    public static final String SCENE_PERSON_AVATAR = "person-avatar";
    public static final String SCENE_COMPANY_AVATAR = "company-avatar";
    public static final String SCENE_CHAT_IMAGE = "chat-image";

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private UploadRateLimitProperties properties;

    public void checkOrThrow(String scene, Long userId) {
        boolean allowed = tryAcquire(scene, userId);
        if (!allowed) {
            throw Exceptions.BusinessException.of(429, "上传过于频繁，请稍后重试");
        }
    }

    public boolean tryAcquire(String scene, Long userId) {
        if (!properties.isEnabled()) {
            return true;
        }
        UploadRateLimitProperties.SceneRule sceneRule = properties.getScenes().get(scene);
        if (sceneRule == null || !sceneRule.isEnabled()) {
            return true;
        }
        boolean userAllowed = tryAcquireUser(scene, userId, sceneRule.getUser());
        if (!userAllowed) {
            return false;
        }
        return tryAcquireGlobal(scene, sceneRule.getGlobal());
    }

    private boolean tryAcquireUser(String scene, Long userId, UploadRateLimitProperties.BucketRule rule) {
        if (rule == null || userId == null) {
            return true;
        }
        String baseKey = properties.getKeyPrefix() + ":" + scene + ":user:" + userId;
        return evalTokenBucket(baseKey, rule);
    }

    private boolean tryAcquireGlobal(String scene, UploadRateLimitProperties.BucketRule rule) {
        if (rule == null) {
            return true;
        }
        String baseKey = properties.getKeyPrefix() + ":" + scene + ":global";
        return evalTokenBucket(baseKey, rule);
    }

    protected boolean evalTokenBucket(String baseKey, UploadRateLimitProperties.BucketRule rule) {
        if (rule.getCapacity() <= 0 || rule.getRefillTokens() <= 0 || rule.getRefillSeconds() <= 0) {
            return true;
        }
        String tokensKey = baseKey + ":tokens";
        String tsKey = baseKey + ":ts";
        long nowMs = System.currentTimeMillis();
        long refillMs = rule.getRefillSeconds() * 1000;
        long ttlSeconds = Math.max(rule.getRefillSeconds() * 2, 2);

        Long result = stringRedisTemplate.execute(
            TOKEN_BUCKET_SCRIPT,
            List.of(tokensKey, tsKey),
            String.valueOf(nowMs),
            String.valueOf(rule.getCapacity()),
            String.valueOf(rule.getRefillTokens()),
            String.valueOf(refillMs),
            "1",
            String.valueOf(ttlSeconds)
        );
        return Objects.equals(result, 1L);
    }
}
