package com.graphhire.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AIConfig {
    @Value("${ai.provider:ollama}")
    private String provider;

    @Value("${ai.deepseek.api-key:}")
    private String deepseekApiKey;

    @Value("${ai.ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
