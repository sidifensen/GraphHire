package com.graphhire.config;

import com.graphhire.common.vo.Result;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    @Test
    void handleGeneral_ShouldNotExposeInternalMessage() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        Result<Void> result = handler.handleGeneral(new RuntimeException("sensitive-error-detail"));

        assertEquals(500, result.getCode());
        assertEquals("服务器内部错误", result.getMessage());
    }
}
