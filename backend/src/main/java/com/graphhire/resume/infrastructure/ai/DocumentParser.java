package com.graphhire.resume.infrastructure.ai;

import org.springframework.stereotype.Component;

/**
 * 文档解析基础设施服务
 *
 * 【模块说明】负责从各类文档（PDF、Word、TXT等）中提取文本内容。
 * 【数据来源】本地文件系统或 RustFS S3 兼容存储。
 * 【依赖服务】DocumentTextExtractor。
 *
 * 【方法概览】
 * - extractText()：从文档提取纯文本
 * - parse()：AI解析（当前为占位实现）
 * - extractStructuredInfo()：提取结构化信息（当前为占位实现）
 */
@Component
public class DocumentParser {

    private final DocumentTextExtractor documentTextExtractor;

    public DocumentParser(DocumentTextExtractor documentTextExtractor) {
        this.documentTextExtractor = documentTextExtractor;
    }

    public String extractText(String filePath) {
        return documentTextExtractor.extractText(filePath);
    }

    public String parse(String rawText) {
        return rawText;
    }

    public String extractStructuredInfo(String rawText) {
        return rawText;
    }
}
