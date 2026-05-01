package com.graphhire.config;

import com.graphhire.common.vo.Result;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GlobalExceptionHandlerTest {

    @Test
    void handleGeneral_ShouldNotExposeInternalMessage() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        Result<Void> result = handler.handleGeneral(new RuntimeException("sensitive-error-detail"));

        assertEquals(500, result.getCode());
        assertEquals("服务器内部错误", result.getMessage());
    }

    @Test
    void handleNoResourceFound_ShouldReturn404() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        NoResourceFoundException exception = new NoResourceFoundException(HttpMethod.GET, "/admin/dashboard/trend");

        Result<Void> result = handler.handleNoResourceFound(exception);

        assertEquals(404, result.getCode());
        assertEquals("请求资源不存在", result.getMessage());
    }

    @Test
    void isClientAbortException_ShouldRecognizeAsyncRequestNotUsableException() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        boolean clientAbort = handler.isClientAbortException(new AsyncRequestNotUsableException("broken pipe"));

        assertTrue(clientAbort);
    }

    @Test
    void isClientAbortException_ShouldIgnoreNormalRuntimeException() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        boolean clientAbort = handler.isClientAbortException(new RuntimeException("boom"));

        assertFalse(clientAbort);
    }
}