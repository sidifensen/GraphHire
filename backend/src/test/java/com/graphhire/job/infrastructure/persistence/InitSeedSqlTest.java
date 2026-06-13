package com.graphhire.job.infrastructure.persistence;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InitSeedSqlTest {

    @Test
    void initSqlShouldOnlySeedFoundationData() throws IOException {
        String initSql = readSql("src/main/resources/db/init.sql");

        // 初始化脚本只承载新环境必须具备的基础字典和演示主数据，运行态消息不应随基线反复灌入。
        assertTrue(initSql.contains("INSERT INTO industry"));
        assertTrue(initSql.contains("INSERT INTO position_type"));
        assertTrue(initSql.contains("INSERT INTO position_type_skill_profile"));
        assertTrue(initSql.contains("INSERT INTO company"));
        assertTrue(initSql.contains("INSERT INTO company_staff"));
        assertTrue(initSql.contains("INSERT INTO sys_user"));
        assertTrue(initSql.contains("INSERT INTO job"));
        // 简历解析结果与匹配记录包含用户上传内容和派生画像，不能作为基线数据分发。
        assertFalse(initSql.contains("INSERT INTO resume"));
        assertFalse(initSql.contains("INSERT INTO match_record"));
        assertFalse(initSql.contains("pg_get_serial_sequence('resume'"));
        assertFalse(initSql.contains("pg_get_serial_sequence('match_record'"));
        assertFalse(initSql.contains("INSERT INTO notification"));
        assertFalse(initSql.contains("INSERT INTO chat_conversation"));
        assertFalse(initSql.contains("INSERT INTO chat_message"));
        assertFalse(initSql.contains("chat_message_resume"));
        assertFalse(initSql.contains("chat_message_interview_invite"));
        assertNoResumeDerivedContent(initSql);
    }

    @Test
    void obsoleteFavoriteTableShouldBeDroppedFromBaselineAndMigration() throws IOException {
        String schemaSql = readSql("src/main/resources/db/schema.sql").toLowerCase(Locale.ROOT);
        String migrationSql = readSql("src/main/resources/db/migration/V2026_06_12_034__drop_obsolete_favorite_table.sql")
            .toLowerCase(Locale.ROOT);

        // favorite 只有历史表和前端空实现，没有后端功能；基线与迁移必须同步清理。
        assertFalse(schemaSql.contains("create table favorite"));
        assertFalse(schemaSql.contains("idx_favorite"));
        assertTrue(migrationSql.contains("drop table if exists favorite"));

        try (Stream<Path> migrationPaths = Files.list(Path.of("src/main/resources/db/migration"))) {
            migrationPaths
                .filter(path -> path.getFileName().toString().endsWith(".sql"))
                .filter(path -> !path.getFileName().toString().equals("V2026_06_12_034__drop_obsolete_favorite_table.sql"))
                .forEach(path -> assertMigrationDoesNotCreateFavorite(path));
        }
    }

    private String readSql(String path) throws IOException {
        return Files.readString(Path.of(path));
    }

    private void assertNoResumeDerivedContent(String initSql) {
        // 只做结构性隐私防线，避免把具体泄露值本身写入测试代码和 Git 历史。
        assertFalse(initSql.contains("file_path"));
        assertFalse(initSql.contains("parse_result"));
        assertFalse(initSql.contains("raw_response"));
        assertFalse(initSql.contains("s3://resumes/"));
    }

    private void assertMigrationDoesNotCreateFavorite(Path path) {
        try {
            String sql = Files.readString(path).toLowerCase(Locale.ROOT);
            assertFalse(sql.contains("create table if not exists favorite"), path + " should not recreate obsolete favorite table");
            assertFalse(sql.contains("create table favorite"), path + " should not recreate obsolete favorite table");
            assertFalse(sql.contains("idx_favorite"), path + " should not recreate obsolete favorite indexes");
        } catch (IOException e) {
            throw new AssertionError("Failed to read migration " + path, e);
        }
    }
}
