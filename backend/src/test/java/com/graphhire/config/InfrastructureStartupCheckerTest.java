package com.graphhire.config;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class InfrastructureStartupCheckerTest {

    @Test
    void parseHostPort_shouldParseJdbcUrl() {
        InfrastructureStartupChecker.HostPort hostPort =
            InfrastructureStartupChecker.parseHostPort("jdbc:postgresql://127.0.0.1:5432/graphhire", 5432);

        assertThat(hostPort.host()).isEqualTo("127.0.0.1");
        assertThat(hostPort.port()).isEqualTo(5432);
    }

    @Test
    void parseHostPort_shouldUseDefaultPortWhenMissing() {
        InfrastructureStartupChecker.HostPort hostPort =
            InfrastructureStartupChecker.parseHostPort("http://localhost", 9000);

        assertThat(hostPort.host()).isEqualTo("localhost");
        assertThat(hostPort.port()).isEqualTo(9000);
    }

    @Test
    void parseHostPort_shouldFallbackWhenMalformed() {
        InfrastructureStartupChecker.HostPort hostPort =
            InfrastructureStartupChecker.parseHostPort("::not-a-valid-endpoint::", 7687);

        assertThat(hostPort.host()).isEqualTo("localhost");
        assertThat(hostPort.port()).isEqualTo(7687);
    }
}

