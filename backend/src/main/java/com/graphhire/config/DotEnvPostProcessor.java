package com.graphhire.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 在 Spring Boot 启动早期加载 .env 文件到 Spring Environment
 * 确保 spring.mail.username 等占位符能在解析前获得正确的值
 */
public class DotEnvPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path workingDir = Paths.get("").toAbsolutePath().normalize();
        Map<String, Object> properties = loadDotenvProperties(workingDir);
        if (properties.isEmpty()) {
            return;
        }

        environment.getPropertySources().addFirst(new MapPropertySource("dotenv", properties));
    }

    Map<String, Object> loadDotenvProperties(Path workingDir) {
        Map<String, Object> properties = new HashMap<>();
        for (Path directory : resolveCandidateDirectories(workingDir)) {
            Dotenv dotenv = Dotenv.configure()
                .directory(directory.toString())
                .filename(".env")
                .ignoreIfMissing()
                .load();

            dotenv.entries().forEach(entry -> properties.putIfAbsent(entry.getKey(), entry.getValue()));
        }
        return properties;
    }

    List<Path> resolveCandidateDirectories(Path workingDir) {
        Set<Path> candidates = new LinkedHashSet<>();
        candidates.add(workingDir);
        candidates.add(workingDir.resolve("backend").normalize());
        return candidates.stream().toList();
    }
}
