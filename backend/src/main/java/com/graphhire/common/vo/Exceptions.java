package com.graphhire.common.vo;

public class Exceptions {
    public static class BusinessException extends RuntimeException {
        private final int code;

        public BusinessException(String message) {
            super(message);
            this.code = 500;
        }

        public BusinessException(int code, String message) {
            super(message);
            this.code = code;
        }

        public static BusinessException of(String message) {
            return new BusinessException(message);
        }

        public static BusinessException of(int code, String message) {
            return new BusinessException(code, message);
        }

        public int getCode() {
            return code;
        }
    }

    public static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }

    public static class ForbiddenException extends RuntimeException {
        public ForbiddenException(String message) {
            super(message);
        }
    }

    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String message) {
            super(message);
        }
    }

    public static class ValidationException extends RuntimeException {
        public ValidationException(String message) {
            super(message);
        }
    }
}
