package com.graphhire.resume.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * 简历解析互斥锁服务。
 * 说明：基于 Redis 分布式锁，防止同一简历在并发请求或重复消费时被重复解析。
 */
@Service
public class ResumeParseLockService {

    private static final String LOCK_PREFIX = "lock:resume:parse:";
    private static final Duration DEFAULT_LOCK_TTL = Duration.ofMinutes(30);

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    /**
     * 使用默认TTL尝试加锁。
     */
    public String tryLock(Long resumeId) {
        return tryLock(resumeId, DEFAULT_LOCK_TTL);
    }

    /**
     * 尝试加锁并返回锁令牌。
     * 说明：返回 token 便于解锁时做所有权校验。
     */
    public String tryLock(Long resumeId, Duration ttl) {
        if (resumeId == null) {
            return null;
        }
        String token = UUID.randomUUID().toString();
        Boolean locked = stringRedisTemplate.opsForValue().setIfAbsent(lockKey(resumeId), token, ttl);
        return Boolean.TRUE.equals(locked) ? token : null;
    }

    /**
     * 按 token 安全解锁。
     * 说明：仅锁持有者可释放，避免误删其他并发请求持有的锁。
     */
    public void unlock(Long resumeId, String token) {
        if (resumeId == null || token == null || token.isBlank()) {
            return;
        }
        String key = lockKey(resumeId);
        String current = stringRedisTemplate.opsForValue().get(key);
        if (token.equals(current)) {
            stringRedisTemplate.delete(key);
        }
    }

    /**
     * 强制解锁。
     * 说明：用于兜底清理异常遗留锁。
     */
    public void forceUnlock(Long resumeId) {
        if (resumeId == null) {
            return;
        }
        stringRedisTemplate.delete(lockKey(resumeId));
    }

    /**
     * 判断当前简历是否存在解析锁。
     */
    public boolean isLocked(Long resumeId) {
        if (resumeId == null) {
            return false;
        }
        return Boolean.TRUE.equals(stringRedisTemplate.hasKey(lockKey(resumeId)));
    }

    private String lockKey(Long resumeId) {
        return LOCK_PREFIX + resumeId;
    }
}
