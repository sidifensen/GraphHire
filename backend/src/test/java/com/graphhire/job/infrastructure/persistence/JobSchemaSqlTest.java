package com.graphhire.job.infrastructure.persistence;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class JobSchemaSqlTest {

    @Test
    void shouldAllowInternJobTypeAndContainThreeTypeComment() throws IOException {
        Path schemaPath = Path.of("src/main/resources/db/schema.sql");
        String schemaSql = Files.readString(schemaPath);

        assertTrue(
                schemaSql.contains("CONSTRAINT chk_job_type CHECK (job_type IN (1, 2, 3))"),
                "job_type 约束必须允许 1/2/3"
        );
        assertTrue(
                schemaSql.contains("COMMENT ON COLUMN job.job_type IS '工作类型：1-全职 2-兼职 3-实习';"),
                "job_type 注释必须包含全职/兼职/实习"
        );
    }
}
