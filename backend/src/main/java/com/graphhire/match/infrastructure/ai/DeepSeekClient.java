package com.graphhire.match.infrastructure.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class DeepSeekClient {

    @Value("${ai.deepseek.api-key:}")
    private String apiKey;

    @Value("${ai.deepseek.url:https://api.deepseek.com/v1}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateMatchReason(Long resumeId, Long jobId) {
        if (apiKey == null || apiKey.isBlank()) {
            return "Based on skill and experience matching";
        }

        String endpoint = baseUrl + "/chat/completions";
        Map<String, Object> requestBody = Map.of(
            "model", "deepseek-chat",
            "messages", new Object[]{
                Map.of("role", "system", "content", "You are a recruitment assistant explaining why a candidate matches a job."),
                Map.of("role", "user", "content", String.format("Explain why resume %d matches job %d", resumeId, jobId))
            }
        );

        try {
            String response = restTemplate.postForObject(endpoint, requestBody, String.class);
            return response;
        } catch (Exception e) {
            return "Based on skill and experience matching";
        }
    }
}
