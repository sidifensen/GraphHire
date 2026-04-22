package com.graphhire.config;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DotEnvPostProcessorTest {

    @Test
    void shouldLoadFromCurrentWorkingDirectory() throws IOException {
        Path workingDir = Files.createTempDirectory("dotenv-cwd");
        Files.writeString(workingDir.resolve(".env"), "ALIYUN_OCR_ACCESS_KEY_ID=cwd-id\n");

        DotEnvPostProcessor processor = new DotEnvPostProcessor();
        Map<String, Object> properties = processor.loadDotenvProperties(workingDir);

        assertEquals("cwd-id", properties.get("ALIYUN_OCR_ACCESS_KEY_ID"));
    }

    @Test
    void shouldFallbackToBackendDirectoryWhenRootEnvMissing() throws IOException {
        Path workingDir = Files.createTempDirectory("dotenv-root");
        Path backendDir = Files.createDirectories(workingDir.resolve("backend"));
        Files.writeString(backendDir.resolve(".env"), "ALIYUN_OCR_ACCESS_KEY_ID=backend-id\n");

        DotEnvPostProcessor processor = new DotEnvPostProcessor();
        Map<String, Object> properties = processor.loadDotenvProperties(workingDir);

        assertEquals("backend-id", properties.get("ALIYUN_OCR_ACCESS_KEY_ID"));
    }

    @Test
    void shouldPrioritizeCurrentWorkingDirectoryOverBackendDirectory() throws IOException {
        Path workingDir = Files.createTempDirectory("dotenv-priority");
        Files.writeString(workingDir.resolve(".env"), "ALIYUN_OCR_ACCESS_KEY_ID=cwd-first\n");
        Path backendDir = Files.createDirectories(workingDir.resolve("backend"));
        Files.writeString(backendDir.resolve(".env"), "ALIYUN_OCR_ACCESS_KEY_ID=backend-second\n");

        DotEnvPostProcessor processor = new DotEnvPostProcessor();
        Map<String, Object> properties = processor.loadDotenvProperties(workingDir);

        assertEquals("cwd-first", properties.get("ALIYUN_OCR_ACCESS_KEY_ID"));
    }
}
