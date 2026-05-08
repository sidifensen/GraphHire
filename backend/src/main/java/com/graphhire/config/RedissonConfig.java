package com.graphhire.config;

import cn.hutool.core.util.StrUtil;
import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Redisson 客户端配置。
 * 说明：复用 Spring Redis 配置创建分布式并发控制客户端，避免双配置漂移。
 */
@Configuration
public class RedissonConfig {

    /**
     * 构建 RedissonClient。
     * 说明：当前部署使用单节点 Redis，直接映射 spring.data.redis 参数。
     */
    @Bean(destroyMethod = "shutdown")
    public RedissonClient redissonClient(RedisProperties redisProperties) {
        Config config = new Config();
        String address = "redis://" + redisProperties.getHost() + ":" + redisProperties.getPort();
        var singleServerConfig = config.useSingleServer()
            .setAddress(address)
            .setDatabase(redisProperties.getDatabase());

        if (StrUtil.isNotBlank(redisProperties.getPassword())) {
            singleServerConfig.setPassword(redisProperties.getPassword());
        }

        Duration timeout = redisProperties.getTimeout();
        if (timeout != null) {
            singleServerConfig.setTimeout((int) timeout.toMillis());
        }
        return Redisson.create(config);
    }
}
