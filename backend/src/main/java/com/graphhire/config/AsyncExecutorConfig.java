package com.graphhire.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 异步执行器配置。
 * 说明：统一托管业务异步线程池，避免业务代码中临时创建线程池导致资源不可控。
 */
@Configuration
public class AsyncExecutorConfig {

    @Value("${app.executor.resume-match.core-pool-size:4}")
    private int resumeMatchCorePoolSize;

    @Value("${app.executor.resume-match.max-pool-size:4}")
    private int resumeMatchMaxPoolSize;

    @Value("${app.executor.resume-match.queue-capacity:256}")
    private int resumeMatchQueueCapacity;

    @Value("${app.executor.auth-mail.core-pool-size:2}")
    private int authMailCorePoolSize;

    @Value("${app.executor.auth-mail.max-pool-size:4}")
    private int authMailMaxPoolSize;

    @Value("${app.executor.auth-mail.queue-capacity:128}")
    private int authMailQueueCapacity;

    /**
     * 简历全职位匹配并发执行器。
     * 说明：并发度固定为4，与历史行为保持一致，降低匹配链路改造风险。
     */
    @Bean(name = "resumeMatchExecutor")
    public Executor resumeMatchExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(resumeMatchCorePoolSize);
        executor.setMaxPoolSize(resumeMatchMaxPoolSize);
        executor.setQueueCapacity(resumeMatchQueueCapacity);
        executor.setThreadNamePrefix("resume-match-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }

    /**
     * 验证码邮件异步执行器。
     * 说明：独立于匹配线程池，避免大批量匹配任务挤占通知类异步任务。
     */
    @Bean(name = "authMailExecutor")
    public Executor authMailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(authMailCorePoolSize);
        executor.setMaxPoolSize(authMailMaxPoolSize);
        executor.setQueueCapacity(authMailQueueCapacity);
        executor.setThreadNamePrefix("auth-mail-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(15);
        executor.initialize();
        return executor;
    }
}
