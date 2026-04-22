package com.graphhire.config;

import cn.hutool.core.io.FileUtil;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.logging.LoggingInitializationContext;
import org.springframework.boot.logging.LoggingSystem;
import org.springframework.core.env.StandardEnvironment;

import java.io.File;
import java.time.Duration;

class LogbackFileOutputPathTest {

    private static final File LOG_DIR = new File("logs");
    private static final File LOG_FILE = new File(LOG_DIR, "graphhire-backend.log");

    @Test
    void shouldWriteLogFileIntoBackendLogsDirectory() throws InterruptedException {
        FileUtil.mkdir(LOG_DIR);
        long sizeBefore = FileUtil.exist(LOG_FILE) ? LOG_FILE.length() : -1L;

        LoggingSystem loggingSystem = LoggingSystem.get(getClass().getClassLoader());
        loggingSystem.beforeInitialize();
        loggingSystem.initialize(new LoggingInitializationContext(new StandardEnvironment()),
                "classpath:logback-spring.xml", null);

        Logger logger = LoggerFactory.getLogger(LogbackFileOutputPathTest.class);
        logger.info("log-output-check:{}", System.nanoTime());
        waitFor(Duration.ofSeconds(2));

        Assertions.assertTrue(
                FileUtil.exist(LOG_FILE),
                "Expected log file at backend/logs/graphhire-backend.log"
        );
        Assertions.assertTrue(
                LOG_FILE.length() > sizeBefore,
                "Expected log file size to grow after writing test log"
        );
    }

    private static void waitFor(Duration timeout) throws InterruptedException {
        long end = System.currentTimeMillis() + timeout.toMillis();
        while (System.currentTimeMillis() < end) {
            if (LOG_FILE.isFile() && LOG_FILE.length() > 0L) {
                return;
            }
            Thread.sleep(100);
        }
    }
}
