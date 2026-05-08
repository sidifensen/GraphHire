package com.graphhire.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 异步执行器配置。
 * 说明：统一托管业务异步线程池，避免业务代码中临时创建线程池导致资源不可控。
 */
@Configuration
public class AsyncExecutorConfig {

    /**
     * 简历全职位匹配并发执行器。
     * 说明：并发度固定为4，与历史行为保持一致，降低匹配链路改造风险。
     */
    @Bean(name = "resumeMatchExecutor")
    public Executor resumeMatchExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(1024);
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
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(256);
        executor.setThreadNamePrefix("auth-mail-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(15);
        executor.initialize();
        return executor;
    }
}
