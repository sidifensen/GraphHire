package com.graphhire.config;

import cn.dev33.satoken.exception.NotLoginException;
import com.graphhire.common.vo.Result;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 * 捕获各类异常并返回统一的 JSON 响应
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Sa-Token 未登录异常
     */
    @ExceptionHandler(NotLoginException.class)
    public Result<Void> handleNotLogin(NotLoginException e) {
        return Result.error(401, "未登录或登录已过期");
    }

    /**
     * 业务异常
     */
    @ExceptionHandler(com.graphhire.common.vo.Exceptions.BusinessException.class)
    public Result<Void> handleBusinessException(com.graphhire.common.vo.Exceptions.BusinessException e) {
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 认证异常
     */
    @ExceptionHandler(com.graphhire.common.vo.Exceptions.UnauthorizedException.class)
    public Result<Void> handleUnauthorized(com.graphhire.common.vo.Exceptions.UnauthorizedException e) {
        return Result.error(401, e.getMessage());
    }

    /**
     * 权限异常
     */
    @ExceptionHandler(com.graphhire.common.vo.Exceptions.ForbiddenException.class)
    public Result<Void> handleForbidden(com.graphhire.common.vo.Exceptions.ForbiddenException e) {
        return Result.error(403, e.getMessage());
    }

    /**
     * 通用异常
     */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleGeneral(Exception e) {
        return Result.error(500, "服务器内部错误: " + e.getMessage());
    }
}