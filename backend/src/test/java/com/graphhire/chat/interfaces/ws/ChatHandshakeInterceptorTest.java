package com.graphhire.chat.interfaces.ws;

import com.graphhire.auth.application.service.AuthAppService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.socket.WebSocketHandler;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ChatHandshakeInterceptorTest {

    private ChatHandshakeInterceptor interceptor;
    private AuthAppService authAppService;

    @BeforeEach
    void setUp() {
        interceptor = new ChatHandshakeInterceptor();
        authAppService = mock(AuthAppService.class);
        org.springframework.test.util.ReflectionTestUtils.setField(interceptor, "authAppService", authAppService);
    }

    @Test
    void beforeHandshake_shouldRejectWhenOnlyQueryTokenProvided() throws Exception {
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        servletRequest.setParameter("token", "query-token-only");
        ServerHttpRequest request = new ServletServerHttpRequest(servletRequest);
        ServerHttpResponse response = mock(ServerHttpResponse.class);
        WebSocketHandler handler = mock(WebSocketHandler.class);
        Map<String, Object> attrs = new HashMap<>();

        boolean allowed = interceptor.beforeHandshake(request, response, handler, attrs);
        assertFalse(allowed);
    }

    @Test
    void beforeHandshake_shouldRejectWhenHeaderTokenInvalid() throws Exception {
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        servletRequest.addHeader("satoken", "invalid-token");
        when(authAppService.validateToken("invalid-token")).thenReturn(false);
        ServerHttpRequest request = new ServletServerHttpRequest(servletRequest);
        ServerHttpResponse response = mock(ServerHttpResponse.class);
        WebSocketHandler handler = mock(WebSocketHandler.class);
        Map<String, Object> attrs = new HashMap<>();

        boolean allowed = interceptor.beforeHandshake(request, response, handler, attrs);
        assertFalse(allowed);
    }
}

