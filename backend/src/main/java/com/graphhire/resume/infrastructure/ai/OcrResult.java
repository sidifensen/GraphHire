package com.graphhire.resume.infrastructure.ai;

public class OcrResult {

    private final boolean success;
    private final String text;
    private final String provider;
    private final String errorCode;
    private final String errorMessage;

    private OcrResult(boolean success, String text, String provider, String errorCode, String errorMessage) {
        this.success = success;
        this.text = text;
        this.provider = provider;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    public static OcrResult success(String text, String provider) {
        return new OcrResult(true, text, provider, null, null);
    }

    public static OcrResult failure(String errorCode, String errorMessage, String provider) {
        return new OcrResult(false, null, provider, errorCode, errorMessage);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getText() {
        return text;
    }

    public String getProvider() {
        return provider;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
