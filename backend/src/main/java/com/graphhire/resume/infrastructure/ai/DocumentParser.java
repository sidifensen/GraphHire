package com.graphhire.resume.infrastructure.ai;

import com.graphhire.resume.infrastructure.file.RustFSClient;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class DocumentParser {

    private final Tika tika = new Tika();

    @Value("${ai.parser.ollama-url:http://localhost:11434}")
    private String ollamaUrl;

    @Autowired
    private RustFSClient rustFSClient;

    public String extractText(String filePath) {
        try {
            // First try to read as local file (for development/testing)
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                try (InputStream stream = Files.newInputStream(path)) {
                    return tika.parseToString(stream);
                }
            }

            // If not a local file, try to download from RustFS/S3
            if (filePath.startsWith("s3://")) {
                byte[] fileBytes = rustFSClient.download(filePath);
                if (fileBytes != null && fileBytes.length > 0) {
                    return tika.parseToString(new java.io.ByteArrayInputStream(fileBytes));
                }
            }

            // Fallback: return empty string if file not found
            return "";
        } catch (IOException | TikaException e) {
            throw new RuntimeException("Failed to extract text from document: " + filePath, e);
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
