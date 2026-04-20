package com.graphhire.resume.infrastructure.ai;

public interface OcrProvider {

    String getProviderName();

    OcrResult recognize(OcrRequest request);
}
