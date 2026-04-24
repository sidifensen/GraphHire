package com.graphhire.config;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * 控制层访问日志切面
 * 【模块说明】统一记录所有Controller方法的调用入口、耗时及异常信息
 * 【数据来源】通过AOP拦截com.graphhire包下所有controller方法
 */
@Slf4j
@Aspect
@Component
public class LoggingAspect {
    @Value("${app.logging.slow-api-threshold-ms:500}")
    private long slowApiThresholdMs;

    /**
     * 环绕通知：记录Controller方法执行情况
     * 【功能说明】在方法执行前后记录日志，包含方法名、耗时、成功/失败状态
     * 【业务步骤】
     * 步骤1：记录方法开始日志
     * 步骤2：执行目标方法并记录耗时
     * 步骤3：方法成功则记录完成日志，失败则记录错误日志并抛出异常
     */
    @Around("execution(* com.graphhire..controller..*(..))")
    public Object logControllerAccess(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long startTime = System.currentTimeMillis();

        try {
            // 步骤2：执行目标方法
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;

            if (duration >= slowApiThresholdMs) {
                log.warn("[API] {} slow call: {}ms", methodName, duration);
            } else if (log.isDebugEnabled()) {
                log.debug("[API] {} completed in {}ms", methodName, duration);
            }
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            // 步骤3：记录异常日志并重新抛出
            log.error("[API] {} failed after {}ms", methodName, duration, e);
            throw e;
        }
    }
}
