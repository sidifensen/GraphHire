package com.graphhire.match.infrastructure.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class OllamaClient {

    @Value("${ai.ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateMatchReason(Long resumeId, Long jobId) {
        String endpoint = ollamaUrl + "/api/generate";

        Map<String, Object> requestBody = Map.of(
            "model", "llama2",
            "prompt", String.format("Explain why resume %d matches job %d in brief", resumeId, jobId),
            "stream", false
        );

        try {
            String response = restTemplate.postForObject(endpoint, requestBody, String.class);
            return response;
        } catch (Exception e) {
            return "Based on skill and experience matching";
        }
    }
}
