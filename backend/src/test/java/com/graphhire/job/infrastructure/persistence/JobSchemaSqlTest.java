package com.graphhire.job.infrastructure.persistence;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class JobSchemaSqlTest {

    @Test
    void shouldContainPositionTypeTableAndJobEducationCodeConstraint() throws IOException {
        Path schemaPath = Path.of("src/main/resources/db/schema.sql");
        String schemaSql = Files.readString(schemaPath);

        assertTrue(
                schemaSql.contains("CREATE TABLE position_type"),
                "必须包含 position_type 表"
        );
        assertTrue(
                !schemaSql.contains("code        BIGINT       NOT NULL UNIQUE"),
                "position_type.code 不应继续存在"
        );
        assertTrue(
                schemaSql.contains("CONSTRAINT chk_position_type_level CHECK (level IN (1, 2, 3))"),
                "position_type.level 约束缺失"
        );
        assertTrue(
                schemaSql.contains("education    SMALLINT"),
                "job.education 必须为 SMALLINT"
        );
        assertTrue(
                schemaSql.contains("CONSTRAINT chk_job_education CHECK (education IS NULL OR education IN (1, 2, 3, 4, 5))"),
                "job.education 编码约束缺失"
        );
        assertTrue(
                schemaSql.contains("position_type_id BIGINT"),
                "job.position_type_id 字段缺失"
        );
        assertTrue(
                schemaSql.contains("CONSTRAINT chk_job_type CHECK (job_type IN (1, 2, 3))"),
                "job_type 约束必须允许 1/2/3"
        );
    }

    @Test
    void shouldAllowInternJobTypeAndContainThreeTypeComment() throws IOException {
        Path schemaPath = Path.of("src/main/resources/db/schema.sql");
        String schemaSql = Files.readString(schemaPath);

        assertTrue(
                schemaSql.contains("COMMENT ON COLUMN job.job_type IS '工作类型：1-全职 2-兼职 3-实习';"),
                "job_type 注释必须包含全职/兼职/实习"
        );
    }
}
