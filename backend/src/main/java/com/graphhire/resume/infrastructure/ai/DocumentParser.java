package com.graphhire.resume.infrastructure.ai;

import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DocumentParser {

    private final Tika tika = new Tika();

    @Value("${ai.parser.ollama-url:http://localhost:11434}")
    private String ollamaUrl;

    public String extractText(String filePath) {
        try {
            // Extract text from document using Apache Tika
            // This is a placeholder - actual implementation would download from S3 first
            return tika.parseToString(new java.io.ByteArrayInputStream(new byte[0]));
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from document", e);
        }
    }

    public String parse(String rawText) {
        // AI-powered parsing would go here
        // For now, return raw text as parse result
        return rawText;
    }

    public String extractStructuredInfo(String rawText) {
        // Extract structured information using AI
        // This would call Ollama or DeepSeek API
        return rawText;
    }
}
