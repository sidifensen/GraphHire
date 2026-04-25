package com.graphhire.config;

import cn.hutool.core.util.StrUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ansi.AnsiColor;
import org.springframework.boot.ansi.AnsiOutput;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/**
 * 应用启动后检查基础依赖服务连通性并打印日志。
 */
@Component
public class InfrastructureStartupChecker implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(InfrastructureStartupChecker.class);
    private static final int CONNECT_TIMEOUT_MS = 1200;

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/graphhire}")
    private String datasourceUrl;

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${memgraph.bolt-url:bolt://localhost:7687}")
    private String memgraphBoltUrl;

    @Value("${rustfs.endpoint:http://localhost:9000}")
    private String rustfsEndpoint;

    @Override
    public void run(ApplicationArguments args) {
        List<ServiceCheck> checks = buildChecks();
        int running = 0;

        log.info(AnsiOutput.toString(AnsiColor.BRIGHT_CYAN, "========== 基础服务启动检查 =========="));
        for (ServiceCheck check : checks) {
            boolean reachable = isReachable(check.host(), check.port(), CONNECT_TIMEOUT_MS);
            if (reachable) {
                running++;
                log.info("{} {} -> {}:{}",
                    AnsiOutput.toString(AnsiColor.BRIGHT_GREEN, "[RUNNING]"),
                    AnsiOutput.toString(AnsiColor.BRIGHT_WHITE, check.name()),
                    check.host(),
                    check.port()
                );
            } else {
                log.warn("{} {} -> {}:{}",
                    AnsiOutput.toString(AnsiColor.BRIGHT_RED, "[NOT RUNNING]"),
                    AnsiOutput.toString(AnsiColor.BRIGHT_YELLOW, check.name()),
                    check.host(),
                    check.port()
                );
            }
        }
        log.info("{} 基础服务检查完成：{}/{} 可连通",
            AnsiOutput.toString(AnsiColor.BRIGHT_CYAN, "[SUMMARY]"),
            running,
            checks.size()
        );
        log.info(AnsiOutput.toString(AnsiColor.BRIGHT_CYAN, "====================================="));
    }

    private List<ServiceCheck> buildChecks() {
        HostPort postgres = parseHostPort(datasourceUrl, 5432);
        HostPort memgraph = parseHostPort(memgraphBoltUrl, 7687);
        HostPort rustfs = parseHostPort(rustfsEndpoint, 9000);

        List<ServiceCheck> checks = new ArrayList<>();
        checks.add(new ServiceCheck("PostgreSQL", postgres.host(), postgres.port()));
        checks.add(new ServiceCheck("Redis", StrUtil.blankToDefault(redisHost, "localhost"), redisPort));
        checks.add(new ServiceCheck("Memgraph", memgraph.host(), memgraph.port()));
        checks.add(new ServiceCheck("RustFS", rustfs.host(), rustfs.port()));
        return checks;
    }

    static HostPort parseHostPort(String endpoint, int defaultPort) {
        if (StrUtil.isBlank(endpoint)) {
            return new HostPort("localhost", defaultPort);
        }

        String normalized = StrUtil.trim(endpoint);
        if (StrUtil.startWithIgnoreCase(normalized, "jdbc:")) {
            normalized = StrUtil.removePrefixIgnoreCase(normalized, "jdbc:");
        }
        if (!normalized.contains("://")) {
            normalized = "tcp://" + normalized;
        }

        try {
            URI uri = URI.create(normalized);
            String host = StrUtil.blankToDefault(uri.getHost(), "localhost");
            int port = uri.getPort() > 0 ? uri.getPort() : defaultPort;
            return new HostPort(host, port);
        } catch (Exception e) {
            return new HostPort("localhost", defaultPort);
        }
    }

    private boolean isReachable(String host, int port, int timeoutMs) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    record HostPort(String host, int port) {
    }

    record ServiceCheck(String name, String host, int port) {
    }
}
