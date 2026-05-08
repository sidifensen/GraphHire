package com.graphhire.resume.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class ResumeParseLockService {

    private static final String LOCK_PREFIX = "lock:resume:parse:";
    private static final Duration DEFAULT_LOCK_TTL = Duration.ofMinutes(30);

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    public String tryLock(Long resumeId) {
        return tryLock(resumeId, DEFAULT_LOCK_TTL);
    }

    public String tryLock(Long resumeId, Duration ttl) {
        if (resumeId == null) {
            return null;
        }
        String token = UUID.randomUUID().toString();
        Boolean locked = stringRedisTemplate.opsForValue().setIfAbsent(lockKey(resumeId), token, ttl);
        return Boolean.TRUE.equals(locked) ? token : null;
    }

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

    public void forceUnlock(Long resumeId) {
        if (resumeId == null) {
            return;
        }
        stringRedisTemplate.delete(lockKey(resumeId));
    }

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
