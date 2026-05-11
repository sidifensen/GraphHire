package com.graphhire.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import static org.assertj.core.api.Assertions.assertThat;

class AsyncExecutorConfigTest {

    @Test
    void resumeMatchExecutor_shouldUseConfiguredPoolSizes() {
        AsyncExecutorConfig config = new AsyncExecutorConfig();
        ReflectionTestUtils.setField(config, "resumeMatchCorePoolSize", 3);
        ReflectionTestUtils.setField(config, "resumeMatchMaxPoolSize", 5);
        ReflectionTestUtils.setField(config, "resumeMatchQueueCapacity", 64);

        ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) config.resumeMatchExecutor();

        assertThat(executor.getCorePoolSize()).isEqualTo(3);
        assertThat(executor.getMaxPoolSize()).isEqualTo(5);
        assertThat(executor.getThreadPoolExecutor().getQueue().remainingCapacity()).isEqualTo(64);
    }
}
