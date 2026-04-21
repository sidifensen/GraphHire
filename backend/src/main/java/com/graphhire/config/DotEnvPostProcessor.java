package com.graphhire.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * 在 Spring Boot 启动早期加载 .env 文件到 Spring Environment
 * 确保 spring.mail.username 等占位符能在解析前获得正确的值
 */
public class DotEnvPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Dotenv dotenv = Dotenv.configure()
            .ignoreIfMissing()
            .load();

        Map<String, Object> properties = new HashMap<>();
        dotenv.entries().forEach(e -> {
            properties.put(e.getKey(), e.getValue());
        });

        environment.getPropertySources().addFirst(new MapPropertySource("dotenv", properties));
    }
}
