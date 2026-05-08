package com.graphhire.upload.application.service;

import com.graphhire.common.vo.Exceptions;
import com.graphhire.config.UploadRateLimitProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UploadRateLimitServiceTest {

    @Mock
    private StringRedisTemplate stringRedisTemplate;

    private UploadRateLimitService service;

    @BeforeEach
    void setUp() throws Exception {
        service = new UploadRateLimitService();
        UploadRateLimitProperties props = new UploadRateLimitProperties();
        UploadRateLimitProperties.SceneRule resumeRule = new UploadRateLimitProperties.SceneRule();
        UploadRateLimitProperties.BucketRule userRule = new UploadRateLimitProperties.BucketRule();
        userRule.setCapacity(2);
        userRule.setRefillTokens(2);
        userRule.setRefillSeconds(60);
        resumeRule.setUser(userRule);
        UploadRateLimitProperties.BucketRule globalRule = new UploadRateLimitProperties.BucketRule();
        globalRule.setCapacity(100);
        globalRule.setRefillTokens(100);
        globalRule.setRefillSeconds(60);
        resumeRule.setGlobal(globalRule);
        props.setScenes(Map.of(UploadRateLimitService.SCENE_RESUME_UPLOAD, resumeRule));

        setField(service, "stringRedisTemplate", stringRedisTemplate);
        setField(service, "properties", props);
    }

    @Test
    @DisplayName("tryAcquire 脚本返回1时应放行")
    void tryAcquire_shouldAllow_whenLuaReturnsOne() {
        when(stringRedisTemplate.execute(any(), anyList(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString()))
            .thenReturn(1L);

        boolean allowed = service.tryAcquire(UploadRateLimitService.SCENE_RESUME_UPLOAD, 100L);

        assertTrue(allowed);
    }

    @Test
    @DisplayName("tryAcquire 脚本返回0时应拒绝")
    void tryAcquire_shouldReject_whenLuaReturnsZero() {
        when(stringRedisTemplate.execute(any(), anyList(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString()))
            .thenReturn(0L);

        boolean allowed = service.tryAcquire(UploadRateLimitService.SCENE_RESUME_UPLOAD, 100L);

        assertFalse(allowed);
    }

    @Test
    @DisplayName("checkOrThrow 超限时应抛出429业务异常")
    void checkOrThrow_shouldThrow429_whenRejected() {
        when(stringRedisTemplate.execute(any(), anyList(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString()))
            .thenReturn(0L);

        Exceptions.BusinessException ex = assertThrows(
            Exceptions.BusinessException.class,
            () -> service.checkOrThrow(UploadRateLimitService.SCENE_RESUME_UPLOAD, 100L)
        );
        assertEquals(429, ex.getCode());
    }

    @Test
    @DisplayName("tryAcquire 应写入用户级和全局级两个桶key")
    void tryAcquire_shouldUseUserAndGlobalKeys() {
        when(stringRedisTemplate.execute(any(), anyList(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString()))
            .thenReturn(1L);

        service.tryAcquire(UploadRateLimitService.SCENE_RESUME_UPLOAD, 99L);

        ArgumentCaptor<List<String>> keysCaptor = ArgumentCaptor.forClass(List.class);
        verify(stringRedisTemplate, times(2)).execute(any(RedisScript.class), keysCaptor.capture(),
            anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
        List<List<String>> allKeys = keysCaptor.getAllValues();
        List<String> firstCallKeys = allKeys.get(0);
        List<String> secondCallKeys = allKeys.get(1);
        assertTrue(firstCallKeys.get(0).contains("upload:rate-limit:resume:user:99"));
        assertTrue(secondCallKeys.get(0).contains("upload:rate-limit:resume:global"));
    }

    private static void setField(Object target, String name, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(name);
        field.setAccessible(true);
        field.set(target, value);
    }
}
