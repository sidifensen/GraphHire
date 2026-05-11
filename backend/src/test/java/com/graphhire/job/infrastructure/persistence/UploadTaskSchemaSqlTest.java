package com.graphhire.job.infrastructure.persistence;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class UploadTaskSchemaSqlTest {

    @Test
    void shouldContainUploadTaskTableAndParseTaskRunningIndex() throws IOException {
        String schemaSql = Files.readString(Path.of("src/main/resources/db/schema.sql"));
        String migrationSql = Files.readString(Path.of("src/main/resources/db/migration/V2026_05_08_031__add_upload_task_for_async_resume.sql"));
        String metadataMigrationSql = Files.readString(Path.of("src/main/resources/db/migration/V2026_05_11_033__upload_task_add_storage_key_and_detected_mime.sql"));

        assertTrue(schemaSql.contains("CREATE TABLE upload_task"), "schema.sql 必须包含 upload_task 建表");
        assertTrue(schemaSql.contains("idx_upload_task_status"), "schema.sql 必须包含 upload_task 状态索引");
        assertTrue(schemaSql.contains("idx_parse_task_resume_running"), "schema.sql 必须包含 parse_task 运行中索引");
        assertTrue(schemaSql.contains("storage_key"), "schema.sql 必须包含 upload_task.storage_key");
        assertTrue(schemaSql.contains("detected_mime_type"), "schema.sql 必须包含 upload_task.detected_mime_type");

        assertTrue(migrationSql.contains("CREATE TABLE IF NOT EXISTS upload_task"), "迁移脚本必须创建 upload_task");
        assertTrue(migrationSql.contains("idx_parse_task_resume_running"), "迁移脚本必须创建 parse_task 运行中索引");
        assertTrue(metadataMigrationSql.contains("storage_key"), "元数据迁移必须增加 storage_key");
        assertTrue(metadataMigrationSql.contains("detected_mime_type"), "元数据迁移必须增加 detected_mime_type");
    }
}
