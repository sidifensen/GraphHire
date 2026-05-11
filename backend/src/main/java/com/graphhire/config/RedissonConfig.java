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
     * 业务意图：将“并发闸门”与“业务 Redis”统一到同一连接配置，减少环境不一致风险。
     *
     * @param redisProperties Spring Redis 配置对象，来源于 `spring.data.redis`。
     * @return Redisson 分布式客户端，用于 semaphore/lock 等分布式控制能力。
     */
    @Bean(destroyMethod = "shutdown")
    public RedissonClient redissonClient(RedisProperties redisProperties) {
        // 步骤1：创建 Redisson 配置根对象。
        Config config = new Config(); // Redisson 全局配置容器。

        // 步骤2：按 host/port 组装 Redis 地址并绑定单节点配置。
        String address = "redis://" + redisProperties.getHost() + ":" + redisProperties.getPort(); // Redis 单节点地址。
        var singleServerConfig = config.useSingleServer() // 当前环境采用单节点模式。
            .setAddress(address) // 设置 Redis 地址。
            .setDatabase(redisProperties.getDatabase()); // 设置逻辑库，确保与 Spring Redis 一致。

        // 步骤3：若配置了密码，注入鉴权信息。
        if (StrUtil.isNotBlank(redisProperties.getPassword())) {
            singleServerConfig.setPassword(redisProperties.getPassword()); // Redis 访问密码。
        }

        // 步骤4：若配置了超时，透传到 Redisson，避免默认超时与 Spring Redis 偏差。
        Duration timeout = redisProperties.getTimeout(); // Spring Redis 超时配置。
        if (timeout != null) {
            singleServerConfig.setTimeout((int) timeout.toMillis()); // Redisson 连接/命令超时（毫秒）。
        }

        // 步骤5：创建并返回 RedissonClient，由 Spring 统一托管生命周期。
        return Redisson.create(config); // Bean 销毁时由 destroyMethod=shutdown 释放连接。
    }
}
