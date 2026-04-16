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

/**
 * 文档解析基础设施服务
 *
 * 【模块说明】负责从各类文档（PDF、Word、TXT等）中提取文本内容。
 * 【数据来源】本地文件系统或 RustFS S3 兼容存储。
 * 【依赖服务】RustFSClient（S3文件下载）、Tika（文档解析）。
 *
 * 【方法概览】
 * - extractText()：从文档提取纯文本
 * - parse()：AI解析（当前为占位实现）
 * - extractStructuredInfo()：提取结构化信息（当前为占位实现）
 */
@Component
public class DocumentParser {

    /** Tika文档解析器，用于从各种格式文档提取文本 */
    private final Tika tika = new Tika();

    /** Ollama AI服务URL，默认为本地地址 */
    @Value("${ai.parser.ollama-url:http://localhost:11434}")
    private String ollamaUrl;

    /** RustFS文件存储客户端 */
    @Autowired
    private RustFSClient rustFSClient;

    /**
     * 从文档提取纯文本
     * 【功能说明】支持本地文件系统和S3存储的文档文本提取。
     * 【业务步骤】
     * 步骤1：尝试作为本地文件读取
     * 步骤2：若为S3路径（s3://），则从RustFS下载后解析
     * 步骤3：若均失败，返回空字符串
     */
    public String extractText(String filePath) {
        try {
            // 步骤1：尝试作为本地文件读取（用于开发/测试）
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                try (InputStream stream = Files.newInputStream(path)) {
                    return tika.parseToString(stream);
                }
            }

            // 步骤2：若为S3路径，从RustFS下载后解析
            if (filePath.startsWith("s3://")) {
                byte[] fileBytes = rustFSClient.download(filePath);
                if (fileBytes != null && fileBytes.length > 0) {
                    return tika.parseToString(new java.io.ByteArrayInputStream(fileBytes));
                }
            }

            // 步骤3：文件未找到，返回空字符串
            return "";
        } catch (IOException | TikaException e) {
            throw new RuntimeException("Failed to extract text from document: " + filePath, e);
        }
    }

    /**
     * AI解析文档
     * 【功能说明】调用AI服务解析文本，提取关键信息（当前为占位实现，返回原文）。
     */
    public String parse(String rawText) {
        // AI解析逻辑占位，当前直接返回原文
        return rawText;
    }

    /**
     * 提取结构化信息
     * 【功能说明】从解析结果中提取结构化信息（当前为占位实现，返回原文）。
     */
    public String extractStructuredInfo(String rawText) {
        // 使用AI提取结构化信息
        // 后续将调用Ollama或DeepSeek API
        return rawText;
    }
}
