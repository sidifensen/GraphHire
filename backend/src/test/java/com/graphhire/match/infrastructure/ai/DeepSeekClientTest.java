package com.graphhire.match.infrastructure.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import cn.hutool.json.JSONUtil;

@ExtendWith(OutputCaptureExtension.class)
class DeepSeekClientTest {

    private HttpServer server;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void generateMatchReason_shouldSendAuthorizationHeader() throws Exception {
        AtomicReference<String> authorization = new AtomicReference<>();
        startServer(exchange -> {
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            writeResponse(exchange, 200, chatCompletionResponse("AI generated reason"));
        });
        DeepSeekClient client = createClient();

        String result = client.generateMatchReason(1L, 2L);

        assertThat(result).isEqualTo("AI generated reason");
        assertThat(authorization.get()).isEqualTo("Bearer test-key");
    }

    @Test
    void calculateMatch_shouldParseJsonFromMessageContent() throws Exception {
        startServer(exchange -> writeResponse(exchange, 200, chatCompletionResponse(
            "{\"skill_score\":91,\"experience_score\":82,\"city_score\":100,\"education_score\":88,\"salary_score\":76,\"overall_score\":89,\"match_reasons\":\"AI result\",\"gaps\":[\"k8s\"],\"suggestions\":[\"learn k8s\"]}"
        )));
        DeepSeekClient client = createClient();

        Map<String, Object> result = client.calculateMatch(sampleUserInfo(), sampleJobInfo());

        assertThat(result.get("skill_score")).isEqualTo(91.0);
        assertThat(result.get("overall_score")).isEqualTo(89.0);
        assertThat(result.get("match_reasons")).isEqualTo("AI result");
        assertThat(result.get("gaps").toString()).contains("k8s");
    }

    @Test
    void calculateMatch_shouldFallbackWhenHttpStatusIsNot2xx(CapturedOutput output) throws Exception {
        startServer(exchange -> writeResponse(exchange, 500, "{" + "\"error\":\"upstream failed\"}"));
        DeepSeekClient client = createClient();

        Map<String, Object> result = client.calculateMatch(sampleUserInfo(), sampleJobInfo());

        assertThat(result.get("match_reasons").toString()).contains("Skills match");
        assertThat(output.getOut()).contains("status=500");
        assertThat(output.getOut()).contains("fallback");
    }

    @Test
    void parseJob_shouldSendAuthorizationHeaderAndParseFencedJson() throws Exception {
        AtomicReference<String> authorization = new AtomicReference<>();
        startServer(exchange -> {
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            writeResponse(exchange, 200, chatCompletionResponse(
                "```json\n{\"skills\":[\"Java\",\"Spring Boot\"],\"requiredExperience\":\"5年\",\"education\":\"本科\",\"summary\":\"后端开发\"}\n```"
            ));
        });
        DeepSeekClient client = createClient();

        Map<String, Object> result = client.parseJob("岗位描述", "Java工程师");

        assertThat(authorization.get()).isEqualTo("Bearer test-key");
        assertThat(result.get("requiredExperience")).isEqualTo("5年");
        assertThat(result.get("education")).isEqualTo("本科");
        assertThat(result.get("skills").toString()).contains("Java", "Spring Boot");
    }

    @Test
    void parseResume_shouldParseFencedJsonContent() throws Exception {
        startServer(exchange -> writeResponse(exchange, 200, chatCompletionResponse(
            "```json\n{\"name\":\"Alice\",\"email\":\"alice@example.com\",\"phone\":\"123456\",\"skills\":[\"Java\"],\"experience\":[],\"education\":[],\"summary\":\"资深工程师\"}\n```"
        )));
        DeepSeekClient client = createClient();

        Map<String, Object> result = client.parseResume("Alice 简历");

        assertThat(result.get("name")).isEqualTo("Alice");
        assertThat(result.get("email")).isEqualTo("alice@example.com");
        assertThat(result.get("skills").toString()).contains("Java");
    }

    @Test
    void parseResume_shouldFallbackWhenContentIsEmpty(CapturedOutput output) throws Exception {
        startServer(exchange -> writeResponse(exchange, 200, chatCompletionResponse("   ")));
        DeepSeekClient client = createClient();

        Map<String, Object> result = client.parseResume("Alice 简历");

        assertThat(result.get("name")).isEqualTo("Extracted Name");
        assertThat(output.getOut()).contains("empty content");
        assertThat(output.getOut()).contains("fallback");
    }

    @Test
    void generateMatchReason_shouldRetryWhenFirstAttemptFails() throws Exception {
        AtomicInteger attempts = new AtomicInteger(0);
        startServer(exchange -> {
            if (attempts.incrementAndGet() == 1) {
                writeResponse(exchange, 500, "{\"error\":\"temporary\"}");
                return;
            }
            writeResponse(exchange, 200, chatCompletionResponse("retry success"));
        });
        DeepSeekClient client = createClient();
        ReflectionTestUtils.setField(client, "maxRetryAttempts", 2);
        ReflectionTestUtils.setField(client, "retryBackoffMs", 1L);

        String result = client.generateMatchReason(1L, 2L);

        assertThat(result).isEqualTo("retry success");
        assertThat(attempts.get()).isEqualTo(2);
    }

    private DeepSeekClient createClient() {
        DeepSeekClient client = new DeepSeekClient();
        ReflectionTestUtils.setField(client, "enabled", true);
        ReflectionTestUtils.setField(client, "apiKey", "test-key");
        ReflectionTestUtils.setField(client, "baseUrl", "http://127.0.0.1:" + server.getAddress().getPort());
        ReflectionTestUtils.setField(client, "timeoutMs", 30000);
        ReflectionTestUtils.setField(client, "maxRetryAttempts", 1);
        ReflectionTestUtils.setField(client, "retryBackoffMs", 1L);
        return client;
    }

    private void startServer(HttpHandler handler) throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/chat/completions", handler);
        server.start();
    }

    private void writeResponse(HttpExchange exchange, int status, String body) throws IOException {
        byte[] payload = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(status, payload.length);
        try (OutputStream outputStream = exchange.getResponseBody()) {
            outputStream.write(payload);
        }
    }

    private String chatCompletionResponse(String content) {
        return JSONUtil.createObj()
            .set("choices", List.of(
                JSONUtil.createObj().set("message", JSONUtil.createObj().set("content", content))
            ))
            .toString();
    }

    private Map<String, Object> sampleUserInfo() {
        return Map.of(
            "skills", List.of("Java", "Spring Boot"),
            "experience_years", 5,
            "target_city", "上海",
            "education", "本科",
            "expected_salary", 30000
        );
    }

    private Map<String, Object> sampleJobInfo() {
        return Map.of(
            "required_skills", List.of("Java", "Spring Boot", "Redis"),
            "experience_required", "3年",
            "city", "上海",
            "education_required", "本科",
            "salary_range", List.of(25000, 35000)
        );
    }
}
