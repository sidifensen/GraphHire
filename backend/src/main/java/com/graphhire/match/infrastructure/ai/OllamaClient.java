package com.graphhire.match.infrastructure.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Ollama本地AI客户端
 * 调用本地部署的Ollama服务（如Llama2）生成匹配原因说明
 */
@Component
public class OllamaClient {

    /** Ollama服务地址，默认 http://localhost:11434 */
    @Value("${ai.ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 生成匹配原因说明
     * 【功能说明】调用Ollama本地模型，根据简历ID和职位ID生成匹配原因文本。
     * @param resumeId 简历ID
     * @param jobId 职位ID
     * @return 匹配原因说明（AI生成或默认文本）
     */
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
