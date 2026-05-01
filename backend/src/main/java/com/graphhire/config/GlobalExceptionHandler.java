package com.graphhire.config;

import cn.dev33.satoken.exception.NotLoginException;
import com.graphhire.common.constants.UploadErrorMessages;
import com.graphhire.common.vo.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 全局异常处理器
 * 捕获各类异常并返回统一的 JSON 响应
 */
@RestControllerAdvice
@Slf4j
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

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(error -> error.getDefaultMessage())
            .orElse("请求参数校验失败");
        return Result.error(400, message);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public Result<Void> handleNoResourceFound(NoResourceFoundException e) {
        return Result.error(404, "请求资源不存在");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public Result<Void> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException e) {
        return Result.error(400, UploadErrorMessages.UPLOAD_SIZE_EXCEEDED);
    }

    @ExceptionHandler(MultipartException.class)
    public Result<Void> handleMultipartException(MultipartException e) {
        String message = e.getMessage();
        if (message != null && message.toLowerCase().contains("size")) {
            return Result.error(400, UploadErrorMessages.UPLOAD_SIZE_EXCEEDED);
        }
        return Result.error(400, UploadErrorMessages.UPLOAD_FAILED_GENERIC);
    }

    /**
     * 通用异常
     */
    @ExceptionHandler(Exception.class)
    public Result<Void> handleGeneral(Exception e) {
        if (isClientAbortException(e)) {
            log.warn("客户端连接已断开，忽略响应写出异常: {}", e.getMessage());
            log.debug("客户端断连异常详情", e);
            return Result.error(500, "服务器内部错误");
        }
        log.error("未处理的异常", e);
        return Result.error(500, "服务器内部错误");
    }

    boolean isClientAbortException(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof AsyncRequestNotUsableException) {
                return true;
            }

            String className = current.getClass().getName();
            if (className.contains("ClientAbortException")) {
                return true;
            }

            String message = current.getMessage();
            if (message != null) {
                String normalized = message.toLowerCase();
                if (normalized.contains("broken pipe")
                    || normalized.contains("connection reset by peer")
                    || normalized.contains("an established connection was aborted")
                    || message.contains("已建立的连接")) {
                    return true;
                }
            }

            current = current.getCause();
        }
        return false;
    }
}
