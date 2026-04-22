package com.graphhire.resume.infrastructure.ai;

public interface OcrService {

    OcrResult recognize(OcrRequest request);
}
