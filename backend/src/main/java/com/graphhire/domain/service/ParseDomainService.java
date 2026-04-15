package com.graphhire.domain.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
public class ParseDomainService {

    private static final Set<String> ALLOWED_FILE_TYPES = Set.of(
            "pdf", "doc", "docx", "txt", "rtf", "html", "md"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final long MIN_FILE_SIZE = 1024;

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/rtf",
            "text/html"
    );

    public boolean validateFileType(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return false;
        }

        String lower = fileName.toLowerCase();
        int dotIndex = lower.lastIndexOf('.');
        if (dotIndex == -1 || dotIndex == lower.length() - 1) {
            return false;
        }

        String extension = lower.substring(dotIndex + 1);
        return ALLOWED_FILE_TYPES.contains(extension);
    }

    public boolean validateFileSize(Long fileSize) {
        if (fileSize == null) {
            return false;
        }
        return fileSize >= MIN_FILE_SIZE && fileSize <= MAX_FILE_SIZE;
    }

    public BigDecimal calculateConfidence(JSONObject parseResult) {
        if (parseResult == null) {
            return BigDecimal.ZERO;
        }

        int fieldCount = 0;
        int nonEmptyCount = 0;

        String[] keyFields = {"name", "education", "experience", "skills", "contact"};

        for (String field : keyFields) {
            if (parseResult.containsKey(field)) {
                fieldCount++;
                Object value = parseResult.get(field);
                if (value != null && !value.toString().trim().isEmpty()) {
                    nonEmptyCount++;
                }
            }
        }

        BigDecimal fieldScore = BigDecimal.valueOf(fieldCount)
                .divide(BigDecimal.valueOf(keyFields.length), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("60"));

        BigDecimal qualityScore = BigDecimal.valueOf(nonEmptyCount)
                .divide(BigDecimal.valueOf(Math.max(fieldCount, 1)), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("40"));

        BigDecimal totalScore = fieldScore.add(qualityScore);

        if (parseResult.containsKey("confidence")) {
            try {
                Object confidence = parseResult.get("confidence");
                if (confidence instanceof Number) {
                    BigDecimal providedConfidence = BigDecimal.valueOf(((Number) confidence).doubleValue());
                    totalScore = totalScore.multiply(new BigDecimal("0.7"))
                            .add(providedConfidence.multiply(new BigDecimal("0.3")));
                }
            } catch (Exception ignored) {
            }
        }

        return totalScore.min(new BigDecimal("100")).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    public static class JSONObject {
        private final Map<String, Object> map = new HashMap<>();

        public void put(String key, Object value) {
            map.put(key, value);
        }

        public Object get(String key) {
            return map.get(key);
        }

        public boolean containsKey(String key) {
            return map.containsKey(key);
        }
    }
}
