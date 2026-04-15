package com.graphhire.infrastructure.mq;

import org.apache.rocketmq.spring.starter.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RocketMQConfig {
    @Value("${rocketmq.namesrv-addr:localhost:9876}")
    private String namesrvAddr;

    @Bean
    public RocketMQTemplate rocketMQTemplate() {
        RocketMQTemplate template = new RocketMQTemplate();
        return template;
    }
}
