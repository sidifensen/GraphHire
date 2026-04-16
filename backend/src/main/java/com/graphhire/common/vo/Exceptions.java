package com.graphhire.common.vo;

/**
 * 业务异常定义
 * 【模块说明】提供项目专用的异常类型，支持错误码和错误消息
 */
public class Exceptions {
    /**
     * 业务异常
     * 【业务规则】默认错误码500，可通过of()指定自定义错误码
     */
    public static class BusinessException extends RuntimeException {
        /** 错误码 */
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

    /** 认证异常：用户未登录或Token无效 */
    public static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }

    /** 权限异常：用户无访问权限 */
    public static class ForbiddenException extends RuntimeException {
        public ForbiddenException(String message) {
            super(message);
        }
    }

    /** 资源不存在异常 */
    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String message) {
            super(message);
        }
    }

    /** 数据校验异常 */
    public static class ValidationException extends RuntimeException {
        public ValidationException(String message) {
            super(message);
        }
    }
}
